import request_progress = require('request-progress');
import gunzip = require('gunzip-maybe');
import { IPackageVersion } from 'vs/workbench/parts/maix/cmake/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { parse, resolve as resolveUrl } from 'url';
import { OperatingSystem, OS } from 'vs/base/common/platform';
import { is64Bit } from 'vs/workbench/parts/maix/_library/node/versions';
import { INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { copy, exists, lstat, mkdirp, readdir, readFile, rename, rimraf, unlink, writeFile } from 'vs/base/node/pfs';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { IProgress } from 'vs/platform/progress/common/progress';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService, ServiceIdentifier, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { extname, resolve as resolveNative } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import * as crypto from 'crypto';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { INotificationService } from 'vs/platform/notification/common/notification';
import Severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { extract as extractZip } from 'vs/platform/node/zip';
import { extract as extractTar } from 'tar-fs';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { inputValidationErrorBorder } from 'vs/platform/theme/common/colorRegistry';
import packageJson from 'vs/platform/node/package';
import { Action } from 'vs/base/common/actions';
import { shell } from 'electron';
import { INodeRequestService } from 'vs/workbench/parts/maix/_library/node/nodeRequestService';
import { dumpDate } from 'vs/workbench/parts/maix/_library/common/dumpDate';
import { IUpdateService, State, StateType, UpdateType } from 'vs/platform/update/common/update';
import { Emitter, Event } from 'vs/base/common/event';
import { IProgressFn, simpleProgressTranslate } from 'vs/workbench/parts/maix/_library/common/progress';
import { IChannelLogger, IChannelLogService } from 'vs/workbench/parts/maix/_library/node/channelLogService';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { basename } from 'vs/base/common/paths';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { CancellationToken } from 'vs/base/common/cancellation';

const distributeUrl = 'https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/'; // MUST end with /
const LAST_UPDATE_CACHE_KEY = '.last-check-update';
const patchVersionKey = 'hot-patch-version';

const UPDATE_KEY_MAIN = 'KendryteIDE';
const UPDATE_KEY_PATCH = 'KendryteIDEPatch';

const UPDATER_LOG = 'maix-update-output-channel';

interface IUpdateStatus {
	project: string;
	version: string;
	downloadUrl: string;
}

export interface IPackagesUpdateService extends IUpdateService {
	run(): TPromise<void>;
}

class PackagesUpdateService implements IPackagesUpdateService {
	public _serviceBrand: any;
	protected platform: string;
	protected arch: string;
	protected localPackage: { [packageName: string]: string } = {};
	protected readonly localConfigFile: string;
	protected runPromise: TPromise<any>;
	protected logger: IChannelLogger;
	private running: TPromise<void>;

	constructor(
		@INodePathService protected nodePathService: INodePathService,
		@INodeRequestService protected nodeRequestService: INodeRequestService,
		@INotificationService protected notificationService: INotificationService,
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IProgressService2 protected progressService: IProgressService2,
		@IStatusbarService protected statusbarService: IStatusbarService,
		@ILifecycleService protected lifecycleService: ILifecycleService,
		@IPartService protected partService: IPartService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IWindowService protected windowService: IWindowService,
		@IWindowsService protected windowsService: IWindowsService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
	) {
		this.logger = channelLogService.createChannel({
			id: UPDATER_LOG, label: 'Kendryte Update', log: true,
		});
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
		this.logger.info('your platform is %s', this.platform);

		if (is64Bit) {
			this.arch = '64';
		} else {
			this.arch = '32';
		}
		this.logger.info('your architecture is %s', this.arch);

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

		const disShutdown = this.lifecycleService.onWillShutdown((e) => {
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
				this.setState(State.Idle(UpdateType.Archive));
				this.logger.info('no recheck, is too fast.');
				return void 0;
			}
			this.logger.info('recheck now.');
			const windowId = this.windowService.getCurrentWindowId();
			this.running = this._run();
			return TPromise.join([
				this.running,
				this.checkForUpdates({ windowId, noResetCache: true }),
			]);
		});

		return this.runPromise.then(() => {
			disShutdown.dispose();
			entry.dispose();
			delete this.runPromise;

			this.cache = {};

			return this.writeCache(LAST_UPDATE_CACHE_KEY, (new Date).getTime().toFixed(0));
		}, (errors: Error[]) => {
			disShutdown.dispose();
			entry.dispose();
			delete this.runPromise;

			this.cache = {};

			this.logger.info('======================================');
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

			const err = errors.find(v => !!v) || new Error('Unknown Error');

			this.logger.info('Update Failed:');
			this.logger.info(err.stack);
			throw err;
		});
	}

	protected async _run(): TPromise<void> {
		try {
			await mkdirp(this.nodePathService.getPackagesPath());
		} catch (e) {
			throw new Error(`Cannot create directory: ${this.nodePathService.getPackagesPath()}\nDo you have permission?`);
		}

		this.logger.info('Starting update...');
		const needUpdate = await this.checkUpdate();

		if (!needUpdate.length) {
			return;
		}
		await this.logger.show();
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
		this.logger.info(' ---- [%s]:', project);

		progress(null, project);

		const installTarget = this.nodePathService.getPackagesPath(project);
		this.logger.info('installTarget=%s', installTarget);

		await this.downloadAndExtract(project, version, downloadUrl, installTarget, progress);

		await this.writeCache(project, version);
	}

	protected async checkUpdate(): TPromise<IUpdateStatus[]> {
		const needUpdate: IUpdateStatus[] = [];
		if (!this.platform) {
			throw new Error('Your platform is not supported. Only Windows and Linux is supported.');
		}
		if (!this.arch) {
			throw new Error('Your platform is not supported. Only x86 and x64 is supported.');
		}

		this.logger.info('local package versions: %j', this.localPackage);

		const list = await this.getPackageList();
		this.logger.info('remote package list: %s', list.join(' '));
		for (const project of list) {
			const remoteVersion = await this.checkUpdateInfo(project);
			if (remoteVersion.ignorePlatform && remoteVersion.ignorePlatform.indexOf(this.platform)) {
				this.logger.info('[%s] not updated: this platform is ignored', project);
				continue;
			}
			if (this.localPackage.hasOwnProperty(project) && remoteVersion.version === this.localPackage[project]) {
				this.logger.info('[%s] not updated: local [%s], remote [%s]', project, remoteVersion.version, this.localPackage[project]);
				continue;
			}

			const downloadUrl: string = this.getPlatformDownloadUrl(remoteVersion);
			if (!downloadUrl) {
				throw new Error('Platform package is not exists: ' + project);
			}
			this.logger.info('[%s] new version [%s]', project, remoteVersion.version);

			needUpdate.push({
				downloadUrl,
				project,
				version: remoteVersion.version,
			});
		}
		this.logger.info('%d package need update', needUpdate.length);
		return needUpdate;
	}

	protected getPlatformDownloadUrl(version: IPackageVersion) {
		let downloadUrl: string;
		if (version['source']) {
			downloadUrl = version['source'];
		} else if (version[this.platform]) {
			downloadUrl = version[this.platform][this.arch] || version[this.platform]['generic'];
		} else {
			return undefined;
		}
		if (!downloadUrl) {
			return undefined;
		}
		return resolveUrl(distributeUrl, downloadUrl);
	}

	protected async getPackage(packageName: string): TPromise<IPackageVersion> {
		const url = resolveUrl(distributeUrl, 'projects/' + packageName + '.json');
		this.logger.info('get package %s info from %s', packageName, url);
		const body = await this.nodeRequestService.getBody(url);
		try {
			return JSON.parse(body) as IPackageVersion;
		} catch (e) {
			e.message = e.stack = `Cannot get package ${packageName} info from ${url}:\n  ${e.message}\n  Server response: ${body}`;
			throw e;
		}
	}

	protected getPackageList(): TPromise<string[]> {
		const url = resolveUrl(distributeUrl, 'projects.lst');
		this.logger.info('get package list from %s', url);
		return this.nodeRequestService.getBody(url).then((content) => {
			return content.split(/\n/g).map(e => e.trim()).filter(e => e.length > 0);
		});
	}

	protected async downloadAndExtract(project: string, remoteVersion: string, downloadUrl: string, installTarget: string, progress: IProgressFn) {
		const zipFile = await this.download(project, remoteVersion, downloadUrl, progress);
		progress(null, 'extracting files...');
		await this.extract(zipFile, installTarget);
	}

	protected async checkHashIfKnown(hash: string, file: string) {
		const alreadyExists = await exists(file);
		if (hash && alreadyExists) {
			const downloadedHash = (await this.hashFile(file)).toLowerCase();
			if (downloadedHash !== hash.toLowerCase()) {
				this.logger.error('hash invalid!\nexpect: %s\ngot   : %s', hash.toLowerCase(), downloadedHash);
				unlink(file);
				return false;
			}
			this.logger.info('hash check pass.');
			return true;
		} else {
			if (alreadyExists) {
				this.logger.info('hash is not set, skip check.');
			}
			return alreadyExists;
		}
	}

	protected async download(project: string, version: string, downloadUrl: string, progress: IProgressFn) {
		const u = parse(downloadUrl);
		let ext = extname(u.pathname).toLowerCase() || '.invalid';
		if (/\.tar\.[a-z0-9]+$/i.test(u.pathname)) {
			ext = '.tar' + ext;
		}
		const hash = (u.hash || '').replace(/^#/, '');

		const downloadTemp = await this.nodePathService.ensureTempDir('packages-update');

		const targetFile = resolvePath(downloadTemp, project + '-' + version + ext);
		const partFile = targetFile + '.partial';

		if (await this.checkHashIfKnown(hash, targetFile)) {
			this.logger.info('file exists, skip.');
			return targetFile;
		}

		this.logger.info('downloadUrl=%s', downloadUrl);
		this.logger.info('partFile=%s', partFile);

		// TODO: continue download
		const response = await this.nodeRequestService.raw('GET', downloadUrl);

		const requestState = request_progress(response, {});

		let notifySize = false;
		requestState.on('progress', (state: ProgressReport) => {
			if (!notifySize) {
				notifySize = true;
				this.logger.info('got header: size=%s', state.size.total);
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
				this.logger.info('download see EOF');
				resolve();
			});
			requestState.pipe(createWriteStream(partFile));
		});

		if (!this.checkHashIfKnown(hash, partFile)) {
			throw new Error(`Cannot install ${project}: hash mismatch.`);
		}

		this.logger.info('move(%s, %s)', partFile, targetFile);
		await rename(partFile, targetFile);
		return targetFile;
	}

	protected async hashFile(file: string) {
		return crypto.createHash('md5').update(await readFile(file)).digest('hex');
	}

	protected unZip(file: string, target: string) {
		return extractZip(file, resolveNative(target), { overwrite: true }, this.logger, CancellationToken.None);
	}

	protected MicrosoftInstall(msi: string, target: string) {
		// toWinJsPromise(import('sudo-prompt')).then(
		return TPromise.wrapError(new Error('not impl'));
	}

	protected unTar(file: string, target: string): TPromise<void> {
		return new TPromise((resolve, reject) => {
			const stream = createReadStream(file)
				.pipe(gunzip())
				.pipe(extractTar(target));

			stream.on('finish', _ => resolve(void 0));
			stream.on('error', e => reject(e));
		});
	}

	protected async extract(zipFile: string, installTarget: string, update: boolean = false): TPromise<void> {
		let unzipTarget = await this.nodePathService.ensureTempDir('packages-extract');
		unzipTarget = resolvePath(unzipTarget, basename(installTarget));

		this.logger.warn('rmdir(%s)', unzipTarget);
		await rimraf(unzipTarget);
		await mkdirp(unzipTarget);
		try {
			if (/\.zip$/.test(zipFile)) {
				this.logger.info(`extract zip to: %s`, installTarget);
				await this.unZip(zipFile, unzipTarget);
			} else if (/\.msi$/.test(zipFile)) {
				this.logger.info(`extract msi file to: %s`, installTarget);
				await this.MicrosoftInstall(zipFile, unzipTarget);
			} else {
				this.logger.info(`extract tar to: %s`, installTarget);
				await this.unTar(zipFile, unzipTarget);
			}
			this.logger.info('Extracted complete');
		} catch (e) {
			this.logger.debug('decompress throw: %s', e.stack);
			this.logger.warn('rmdir(%s)', unzipTarget);
			await rimraf(unzipTarget);
			await unlink(zipFile);
			throw new Error('Cannot decompress file: ' + zipFile + ' \nError:' + e);
		}

		const contents = await readdir(unzipTarget);
		let copyFrom = unzipTarget;
		this.logger.info('extracted folder content: [%s]', contents.join(', '));
		if (contents.length === 1) {
			const stat = await lstat(resolvePath(unzipTarget, contents[0]));
			if (stat.isDirectory()) {
				this.logger.debug('use only sub folder as root');
				copyFrom += `/${contents[0]}`;
			} // else nothing
		} else if (contents.length === 0) {
			throw new Error('Invalid package: empty file');
		}

		if (!update) {
			this.logger.info('rimraf(%s)', installTarget);
			await rimraf(installTarget);
		}

		this.logger.warn('copy(%s, %s)', unzipTarget, installTarget);
		await copy(copyFrom, installTarget);

		rimraf(unzipTarget); // remove empty folder when single sub folder mode.
	}

	protected async isUpdateAlreadyCheckedMomentsAgo(): TPromise<boolean> {
		if (!this.localPackage.hasOwnProperty(LAST_UPDATE_CACHE_KEY)) {
			this.logger.info('update has never checked');
			return false;
		}
		this.logger.info('last update checked: %s', dumpDate.time(this.localPackage[LAST_UPDATE_CACHE_KEY]));
		const lastDate = new Date(parseInt(this.localPackage[LAST_UPDATE_CACHE_KEY]));
		if (isNaN(lastDate.getTime())) {
			this.logger.info('update time invalid');
			return false;
		}

		const mustRecheck = lastDate;
		mustRecheck.setHours(mustRecheck.getMinutes() + 30);
		this.logger.info('next update check: %s', dumpDate.time(mustRecheck));
		return (new Date) <= mustRecheck;
	}

	protected async loadLocalVersionCache(): TPromise<void> {
		if (await exists(this.localConfigFile)) {
			this.localPackage = JSON.parse(await readFile(this.localConfigFile, 'utf8'));
		} else {
			this.localPackage = {};
		}
	}

	/* * class of WrappedUpdateService */
	protected readonly _onStateChange: Emitter<State> = new Emitter<State>();
	public readonly onStateChange: Event<State> = this._onStateChange.event;
	public _state: State = State.Uninitialized;

	get patchVersion() {
		return this.localPackage[patchVersionKey] || '';
	}

	protected downloaded: string;

	public get state() {
		return this._state;
	}

	protected setState(state: State): void {
		this.logger.info('update#setState(%s)', state.type);
		this._state = state;
		this._onStateChange.fire(state);
	}

	public async applyUpdate(): TPromise<void> {
		if (!this.downloaded) {
			await this.downloadUpdate();
		}
		const patch = await this.checkUpdateInfo(UPDATE_KEY_PATCH);
		this.setState(State.Updating({
			version: patch.version,
			productVersion: patch.version,
		}));

		const patchZip = this.downloaded;
		const installTarget = resolvePath(this.nodePathService.getInstallPath(), 'resources/app');
		this.logger.info('applyIDEPatch: ', patchZip, installTarget);
		await this.extract(patchZip, installTarget, true);

		this.setState(State.Ready({
			version: patch.version,
			productVersion: patch.version,
		}));
	}

	protected async notifyUpdate() {
		const main = await this.checkUpdateInfo(UPDATE_KEY_MAIN);
		this.logger.warn('Base environment is update: local %s, remote %s', packageJson.version, main.version);
		const homepage = main.homepageUrl || 'https://github.com/kendryte/kendryte-ide';
		this.logger.info('remote url: %s', homepage);
		this.notificationService.prompt(Severity.Info, 'KendryteIDE has updated.\n', [
			new OpenDownloadAction(homepage),
			{
				label: 'Not now',
				run() { },
			},
		]);
	}

	public async checkForUpdates(context: any): TPromise<void> {
		this.setState(State.Uninitialized);
		if (!this.environmentService.isBuilt) {
			this.logger.info('KendryteIDE update disabled (dev mode): %s', packageJson.version);
			return;
		}

		if (context && !context.noResetCache) {
			this.cache = {};
		}

		this.setState(State.CheckingForUpdates({}));

		const main = await this.checkUpdateInfo(UPDATE_KEY_MAIN);
		if (main.version === packageJson.version) {
			this.logger.info('Base environment is up to date: [%s].', main.version);

			const patch = await this.checkUpdateInfo(UPDATE_KEY_PATCH);
			if (patch.version === this.patchVersion) {
				this.logger.info('KendryteIDE is up to date: [%s].', patch.version);
				this.setState(State.Idle(UpdateType.Archive));
				return;
			} else {
				this.logger.warn('KendryteIDE is update: local %s, remote %s', this.patchVersion, patch.version);
				await this.downloadUpdate();
				await this.applyUpdate();
				await this.writeCache(patchVersionKey, patch.version);
				await this.quitAndInstall();
			}
		} else {
			await this.notifyUpdate();
			this.setState(State.AvailableForDownload({
				version: main.version,
				productVersion: main.version,
			}));
		}
	}

	public async downloadUpdate(): TPromise<void> {
		if (this._state.type === StateType.Downloading) {
			throw new Error('update is in progress...');
		}

		const patch = await this.checkUpdateInfo(UPDATE_KEY_PATCH);
		const downloadUrl = this.getPlatformDownloadUrl(patch);

		const info = {
			version: patch.version,
			productVersion: patch.version,
		};

		this.setState(State.Downloading(info));

		await this.progressService.withProgress({
			location: ProgressLocation.Notification,
			title: 'updating patch...',
			cancellable: false,
		}, async (report) => {
			const transFn = simpleProgressTranslate(report);

			this.downloaded = await this.download(UPDATE_KEY_PATCH, patch.version, downloadUrl, transFn);
		});
		this.setState(State.Downloaded(info));
	}

	public async isLatestVersion(): TPromise<boolean | undefined> {
		if (!this.environmentService.isBuilt) {
			this.logger.info('KendryteIDE update disabled (dev mode): %s', packageJson.version);
			return true;
		}
		const main = await this.checkUpdateInfo(UPDATE_KEY_MAIN);
		if (main.version !== packageJson.version) {
			this.setState(State.AvailableForDownload({
				version: main.version,
				productVersion: main.version,
			}));
			await this.notifyUpdate();
			return false;
		}
		const patch = await this.checkUpdateInfo(UPDATE_KEY_PATCH);
		if (patch.version !== this.patchVersion) {
			this.setState(State.AvailableForDownload({
				version: main.version,
				productVersion: patch.version,
			}));
			return false;
		}

		this.setState(State.Idle(UpdateType.Archive));

		// todo: notify
		return false;
	}

	public async quitAndInstall(): TPromise<void> {
		await this.running;
		await this.windowsService.relaunch({});
		return undefined;
	}

	protected cache: { [id: string]: IPackageVersion } = {};

	protected async checkUpdateInfo(type: string): TPromise<IPackageVersion> {
		if (this.cache[type]) {
			return this.cache[type];
		}
		this.cache[type] = await this.getPackage(type);
		return this.cache[type];
	}
}

class OpenDownloadAction extends Action {
	public static readonly ID = 'workbench.action.kendryte.homepage';
	public static readonly LABEL = localize('KendryteIOEditor', 'Update now');

	constructor(
		protected url: string,
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

/** @deprecated use IUpdateService */
export const IPackagesUpdateService = IUpdateService as any as ServiceIdentifier<IPackagesUpdateService>;

registerSingleton(IUpdateService, PackagesUpdateService);
