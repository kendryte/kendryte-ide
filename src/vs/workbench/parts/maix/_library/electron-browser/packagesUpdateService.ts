import request_progress = require('request-progress');
import gunzip = require('gunzip-maybe');
import { IPackageVersion } from 'vs/workbench/parts/maix/cmake/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { parse, resolve as resolveUrl } from 'url';
import { OperatingSystem, OS } from 'vs/base/common/platform';
import { is64Bit } from 'vs/workbench/parts/maix/_library/node/versions';
import { INodePathService } from 'vs/workbench/parts/maix/_library/node/nodePathService';
import { exists, mkdirp, readdir, readFile, rename, rimraf, unlink, writeFile } from 'vs/base/node/pfs';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { IProgress } from 'vs/platform/progress/common/progress';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator, IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { extname, resolve as resolveNative } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import * as crypto from 'crypto';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { INotificationService } from 'vs/platform/notification/common/notification';
import Severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { extract as extractZip } from 'vs/base/node/zip';
import { extract as extractTar } from 'tar-fs';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ChannelLogService } from 'vs/workbench/parts/maix/_library/electron-browser/channelLog';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { inputValidationErrorBorder } from 'vs/platform/theme/common/colorRegistry';
import packageJson from 'vs/platform/node/package';
import { Action } from 'vs/base/common/actions';
import { shell } from 'electron';
import { INodeRequestService } from 'vs/workbench/parts/maix/_library/node/nodeRequestService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

const distributeUrl = 'https://s3.cn-northwest-1.amazonaws.com.cn/maix-ide/';
const LAST_UPDATE_CACHE_KEY = '.last-check-update';

interface IUpdateStatus {
	project: string;
	version: string;
	downloadUrl: string;
}

export interface IPackagesUpdateService {
	_serviceBrand: any;

	run(): TPromise<void>;
}

export const IPackagesUpdateService = createDecorator<IPackagesUpdateService>('IPackagesUpdateService');

interface IProgressFn {
	(current: number | null, message?: string): void;
}

class PackagesUpdateService implements IPackagesUpdateService {
	_serviceBrand: any;

	private platform: string;
	private arch: string;
	private localPackage: { [packageName: string]: string } = {};
	private readonly localConfigFile: string;
	private runPromise: TPromise<any>;
	private logService: ChannelLogService;

	constructor(
		@INodePathService private nodePathService: INodePathService,
		@INodeRequestService private nodeRequestService: INodeRequestService,
		@INotificationService private notificationService: INotificationService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IProgressService2 private progressService: IProgressService2,
		@IStatusbarService private statusbarService: IStatusbarService,
		@ILifecycleService private lifecycleService: ILifecycleService,
		@IEnvironmentService private environmentService: IEnvironmentService,
		@IPartService private partService: IPartService,
	) {
		this.logService = instantiationService.createInstance(ChannelLogService, 'maix-updator', 'Maix Update');
		switch (OS) {
			case OperatingSystem.Windows:
				this.platform = 'windows';
				break;
			case OperatingSystem.Linux:
				this.platform = 'linux';
				break;
			// case OperatingSystem.Macintosh:
			// 	platform = 'mac';
			// break;
			default:
				return;
		}
		this.logService.info('your platform is %s', this.platform);

		if (is64Bit) {
			this.arch = '64';
		} else {
			this.arch = '32';
		}
		this.logService.info('your architecture is %s', this.arch);

		this.localConfigFile = this.nodePathService.getPackagesPath('versions.json');
	}

	protected async writeCache(name: string, value: string) {
		this.localPackage[name] = value;
		await writeFile(this.localConfigFile, JSON.stringify(this.localPackage, null, 4));
	}

	run(): TPromise<void> {
		if (this.runPromise) {
			return this.runPromise;
		}

		this.lifecycleService.onWillShutdown((e) => {
			if (this.runPromise) {
				const force = confirm('Update is in progress.\nDo you want to force quit?\nUpdate will continue next time.');
				e.veto(!force);
			}
		});
		const entry = this.statusbarService.setStatusMessage('$(sync~spin) Updating packages... please wait...');
		this.runPromise = this.loadLocalVersionCache().then(() => {
			return this.isUpdateAlreadyCheckedMomentsAgo();
		}).then((upToDate) => {
			if (upToDate) {
				this.logService.info('no recheck, is too fast.');
				return void 0;
			}
			this.logService.info('recheck now.');
			return TPromise.join([
				this._run(),
				this.checkMainUpdate(),
			]);
		});

		return this.runPromise.then(() => {
			entry.dispose();
			delete this.runPromise;

			return this.writeCache(LAST_UPDATE_CACHE_KEY, (new Date).getTime().toFixed(0));
		}, (error) => {
			entry.dispose();
			delete this.runPromise;
			this.logService.info('======================================');
			this.logService.info('Update Failed:');
			this.logService.info(error.stack);
			this.statusbarService.addEntry({
				text: '$(sync~spin)$(x) Failed to download required packages, please check your internet connection... (click to retry)',
				color: inputValidationErrorBorder,
				command: 'workbench.action.reloadWindow',
			}, StatusbarAlignment.LEFT, 0);
			this.notificationService.prompt(Severity.Error, localize('maix.failed-retry', 'Failed to download required packages, do you like to retry?'), [
				{
					label: 'Yes (' + localize('recommended', 'Recommended') + ')',
					run: () => {
						this.instantiationService.invokeFunction((access: ServicesAccessor) => {
							const windowService: IWindowService = access.get(IWindowService);
							windowService.reloadWindow();
						});
					},
				}, {
					label: 'No',
					run() { },
				},
			]);
			throw error;
		});
	}

	protected async _run(): TPromise<void> {
		try {
			await mkdirp(this.nodePathService.getPackagesPath());
		} catch (e) {
			throw new Error(`Cannot create directory: ${this.nodePathService.getPackagesPath()}\nDo you have permission?`);
		}

		this.logService.info('Starting update...');
		const needUpdate = await this._checkUpdate();

		if (!needUpdate.length) {
			return;
		}
		await this.logService.show();
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		return this.progressService.withProgress({
			location: ProgressLocation.Notification,
			title: 'updating',
			cancellable: false,
		}, async (reporter: IProgress<IProgressStep>) => {
			const r = needUpdate.length;
			let last = 0;
			let ok = 0;
			let lastInfinite = false;
			let currentProject: string = '...';

			const progressFn: IProgressFn = (p: number, m?: string) => {
				m = m ? `${currentProject} - ${m}` : currentProject;
				if (p === null) {
					lastInfinite = true;
					reporter.report({ increment: -1, message: m });
				} else {
					const current = ok * (100 / r) + (p / r);
					if (lastInfinite) {
						lastInfinite = false;
						reporter.report({ increment: current, message: m });
					} else {
						const delta = current - last;
						reporter.report({ increment: delta, message: m });
					}
					last = current;
				}
			};

			for (const item of needUpdate) {
				reporter.report({ message: item.project + '...' });

				currentProject = item.project;
				await this._doUpdate(item, progressFn);
				ok++;
			}
		});
	}

	protected async _doUpdate({ project, downloadUrl, version }: IUpdateStatus, progress: IProgressFn) {
		this.logService.info(' ---- [%s]:', project);
		progress(null, project);

		const installTarget = this.nodePathService.getPackagesPath(project);
		this.logService.info('installTarget=%s', installTarget);

		await this.downloadAndExtract(project, version, downloadUrl, installTarget, progress);

		await this.writeCache(project, version);
	}

	protected async _checkUpdate(): TPromise<IUpdateStatus[]> {
		const needUpdate: IUpdateStatus[] = [];
		if (!this.platform) {
			throw new Error('Your platform is not supported. Only Windows and Linux is supported.');
		}
		if (!this.arch) {
			throw new Error('Your platform is not supported. Only x86 and x64 is supported.');
		}

		this.logService.info('local package versions: %j', this.localPackage);

		const list = await this.getPackageList();
		this.logService.info('remote package list: %s', list.join(' '));
		for (const project of list) {
			if (project.toLowerCase() === 'maixide') {
				continue;
			}
			const remoteVersion = await this.getPackage(project);
			if (remoteVersion.ignorePlatform && remoteVersion.ignorePlatform.indexOf(this.platform)) {
				this.logService.info('[%s] not updated: this platform is ignored', project);
				continue;
			}
			if (this.localPackage.hasOwnProperty(project) && remoteVersion.version === this.localPackage[project]) {
				this.logService.info('[%s] not updated: local [%s], remote [%s]', project, remoteVersion.version, this.localPackage[project]);
				continue;
			}

			let downloadUrl: string;
			if (remoteVersion['source']) {
				downloadUrl = remoteVersion['source'];
			} else if (remoteVersion[this.platform]) {
				downloadUrl = remoteVersion[this.platform][this.arch] || remoteVersion[this.platform]['generic'];
			} else {
				throw new Error('Platform package is not exists: ' + project);
			}
			this.logService.info('[%s] new version [%s]', project, remoteVersion.version);

			needUpdate.push({
				downloadUrl,
				project,
				version: remoteVersion.version,
			});
		}
		this.logService.info('%d package need update', needUpdate.length);
		return needUpdate;
	}

	protected async getPackage(packageName: string): TPromise<IPackageVersion> {
		const url = resolveUrl(distributeUrl, 'projects/' + packageName + '.json');
		this.logService.info('get package %s info from %s', packageName, url);
		const body = await this.nodeRequestService.getBody(url);
		return JSON.parse(body) as IPackageVersion;
	}

	protected getPackageList(): TPromise<string[]> {
		const url = resolveUrl(distributeUrl, 'projects.lst');
		this.logService.info('get package list from %s', url);
		return this.nodeRequestService.getBody(url).then((content) => {
			return content.split(/\n/g).map(e => e.trim()).filter(e => e.length > 0);
		});
	}

	protected async downloadAndExtract(project: string, remoteVersion: string, downloadUrl: string, installTarget: string, progress: IProgressFn) {
		const zipFile = await this.download(project, remoteVersion, downloadUrl, installTarget, progress);
		progress(null, 'extracting files...');
		await this.extract(zipFile, installTarget);
	}

	protected async checkHashIfKnown(hash: string, file: string) {
		const alreadyExists = await exists(file);
		if (hash && alreadyExists) {
			const downloadedHash = (await this.hashFile(file)).toLowerCase();
			if (downloadedHash !== hash.toLowerCase()) {
				this.logService.error('hash invalid!\nexpect: %s\ngot   : %s', hash.toLowerCase(), downloadedHash);
				unlink(file);
				return false;
			}
			this.logService.info('hash check pass.');
			return true;
		} else {
			if (alreadyExists) {
				this.logService.info('hash is not set, skip check.');
			}
			return alreadyExists;
		}
	}

	protected async download(project: string, version: string, downloadUrl: string, installTarget: string, progress: IProgressFn) {
		const u = parse(downloadUrl);
		let ext = extname(u.pathname).toLowerCase() || '.invalid';
		if (/\.tar\.[a-z0-9]+$/i.test(u.pathname)) {
			ext = '.tar' + ext;
		}
		const hash = (u.hash || '').replace(/^#/, '');
		const targetFile = installTarget + '-' + version + ext;
		const partFile = targetFile + '.partial';

		if (await this.checkHashIfKnown(hash, targetFile)) {
			this.logService.info('file exists, skip.');
			return targetFile;
		}

		this.logService.info('downloadUrl=%s', downloadUrl);
		this.logService.info('partFile=%s', partFile);

		const response = await this.nodeRequestService.raw('GET', downloadUrl);

		const requestState = request_progress(response, {});

		let notifySize = false;
		requestState.on('progress', (state: ProgressReport) => {
			if (!notifySize) {
				notifySize = true;
				this.logService.info('got header: size=%s', state.size.total);
			}

			const progPercent = (state.percent * 100).toFixed(0) + '%';
			const progSpeed = ((state.speed / 1024) / 8).toFixed(2) + ' KB/s';
			const percent = Math.floor(state.percent * 100);
			progress(percent, `${progPercent} @ ${progSpeed}`);
		});

		await new Promise((resolve, reject) => {
			requestState.on('error', e => {
				// Do something with err
				reject(new Error(`Error when downloading ${downloadUrl}. ${e}`));
			});
			requestState.on('end', () => {
				this.logService.info('download see EOF');
				resolve();
			});
			requestState.pipe(createWriteStream(partFile));
		});

		if (!this.checkHashIfKnown(hash, partFile)) {
			throw new Error(`Cannot install ${project}: hash mismatch.`);
		}

		this.logService.info('move(%s, %s)', partFile, targetFile);
		await rename(partFile, targetFile);
		return targetFile;
	}

	private async hashFile(file: string) {
		return crypto.createHash('md5').update(await readFile(file)).digest('hex');
	}

	public unZip(file: string, target: string) {
		return extractZip(file, resolveNative(target), { overwrite: true }, this.logService);
	}

	public MicrosoftInstall(msi: string, target: string) {
		// toWinJsPromise(import('sudo-prompt')).then(
		return TPromise.wrapError(new Error('not impl'));
	}

	public unTar(file: string, target: string): TPromise<void> {
		return new TPromise((resolve, reject) => {
			const stream = createReadStream(file)
				.pipe(gunzip())
				.pipe(extractTar(target));

			stream.on('finish', _ => resolve(void 0));
			stream.on('error', e => reject(e));
		});
	}

	private async extract(zipFile: string, installTarget: string) {
		let unzipTarget = installTarget + '.unzip';
		this.logService.warn('rmdir(%s)', unzipTarget);
		await rimraf(unzipTarget);
		await mkdirp(unzipTarget);
		try {
			if (/\.zip$/.test(zipFile)) {
				this.logService.info(`extract zip to: %s`, installTarget);
				await this.unZip(zipFile, unzipTarget);
			} else if (/\.msi$/.test(zipFile)) {
				this.logService.info(`extract msi file to: %s`, installTarget);
				await this.MicrosoftInstall(zipFile, unzipTarget);
			} else {
				this.logService.info(`extract tar to: %s`, installTarget);
				await this.unTar(zipFile, unzipTarget);
			}
			this.logService.info('Extracted complete');
		} catch (e) {
			this.logService.debug('decompress throw: %s', e.stack);
			this.logService.warn('rmdir(%s)', unzipTarget);
			await rimraf(unzipTarget);
			await unlink(zipFile);
			throw new Error('Cannot decompress file: ' + zipFile + ' \nError:' + e);
		}

		const contents = await readdir(unzipTarget);
		this.logService.info('extracted folder content: [%s]', contents.join(', '));
		if (contents.length === 1) {
			this.logService.debug('use only sub folder as root');
			unzipTarget += `/${contents[0]}`;
		} else if (contents.length === 0) {
			throw new Error('Invalid package: empty file');
		}

		this.logService.info('rimraf(installTarget)');
		await rimraf(installTarget);

		this.logService.warn('rename(%s, %s)', unzipTarget, installTarget);
		await rename(unzipTarget, installTarget);

		rimraf(installTarget + '.unzip'); // remove empty folder when single sub folder mode.
	}

	private async checkMainUpdate() {
		if (!this.environmentService.isBuilt) {
			this.logService.info('MaixIDE update disabled (dev mode): %s', packageJson.version);
			return;
		}
		const data = await this.getPackage('MaixIDE');
		if (data.version === packageJson.version) {
			this.logService.info('MaixIDE is up to date: [%s].', data.version);
		} else {
			this.logService.warn('MaixIDE is update: local %s, remote %s', packageJson.version, data.version);
			const homepage = data.homepageUrl || 'https://github.com/Canaan-Creative/maix-ide/releases';
			this.logService.info('remote url: %s', homepage);
			this.notificationService.prompt(Severity.Info, 'MaixIDE has updated.\n', [
				new OpenDownloadAction(homepage),
				{
					label: 'Not now',
					run() { },
				},
			]);
		}
	}

	private async isUpdateAlreadyCheckedMomentsAgo(): TPromise<boolean> {
		if (!this.localPackage.hasOwnProperty(LAST_UPDATE_CACHE_KEY)) {
			this.logService.info('update has never checked');
			return false;
		}
		this.logService.info('last update checked: %s', this.localPackage[LAST_UPDATE_CACHE_KEY]);
		const lastDate = new Date(parseInt(this.localPackage[LAST_UPDATE_CACHE_KEY]));
		if (isNaN(lastDate.getTime())) {
			this.logService.info('update time invalid');
			return false;
		}

		const mustRecheck = lastDate;
		mustRecheck.setHours(mustRecheck.getHours() + 1);
		return (new Date) <= mustRecheck;
	}

	private async loadLocalVersionCache(): TPromise<void> {
		if (await exists(this.localConfigFile)) {
			this.localPackage = JSON.parse(await readFile(this.localConfigFile, 'utf8'));
		} else {
			this.localPackage = {};
		}
	}
}

registerSingleton(IPackagesUpdateService, PackagesUpdateService);

class OpenDownloadAction extends Action {
	public static readonly ID = 'workbench.action.maix.homepage';
	public static readonly LABEL = localize('MaixIOEditor', 'Update now');

	constructor(
		private url: string,
	) {
		super(OpenDownloadAction.ID, OpenDownloadAction.LABEL);
	}

	public run(event?: any): TPromise<boolean> {
		return new TPromise<boolean>((resolve, reject) => {
			resolve(shell.openExternal(this.url, undefined, e => reject(e)));
		});
	}

	public dispose(): void {
	}
}