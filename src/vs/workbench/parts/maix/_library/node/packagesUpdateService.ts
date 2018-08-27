import decompress = require('decompress');
import request_progress = require('request-progress');
import { IPackageVersion } from 'vs/workbench/parts/maix/cmake/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { asJson, asText, IRequestOptions } from 'vs/base/node/request';
import { parse, resolve as resolveUrl } from 'url';
import { OperatingSystem, OS } from 'vs/base/common/platform';
import { is64Bit } from 'vs/workbench/parts/maix/_library/node/versions';
import { IHTTPConfiguration, IRequestService } from 'vs/platform/request/node/request';
import { INodePathService } from 'vs/workbench/parts/maix/_library/node/nodePathService';
import { exists, mkdirp, readFile, rmdir, unlink, writeFile } from 'vs/base/node/pfs';
import { emptyDir, move } from 'fs-extra';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { IProgress } from 'vs/platform/progress/common/progress';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Emitter, Event } from 'vs/base/common/event';
import { get } from 'request';
import { extname } from 'path';
import { createWriteStream } from 'fs';
import * as crypto from 'crypto';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { getProxyAgent } from 'vs/base/node/proxy';
import { assign } from 'vs/base/common/objects';
import { IStatusbarService } from 'vs/platform/statusbar/common/statusbar';

const distributeUrl = 'https://raw.githubusercontent.com/Canaan-Creative/release-registry/master/';

interface IUpdateStatus {
	project: string;
	version: string;
	downloadUrl: string;
}

export interface IPackagesUpdateService {
	_serviceBrand: any;

	run(): TPromise<void>;

	readonly hasError: boolean;
	onDidChangeState: Event<boolean>;
}

export const IPackagesUpdateService = createDecorator<IPackagesUpdateService>('IPackagesUpdateService');

interface IProgressFn {
	(current: number | null, message?: string): void;
}

class PackagesUpdateService implements IPackagesUpdateService {
	_serviceBrand: any;

	private readonly _onDidChangeState = new Emitter<boolean>();
	public readonly onDidChangeState: Event<boolean> = this._onDidChangeState.event;

	private platform: string;
	private arch: string;
	private localPackage: { [packageName: string]: string } = {};
	private readonly localConfigFile: string;
	private _error: Error = null;

	constructor(
		@IRequestService private requestService: IRequestService,
		@INodePathService private nodePathService: INodePathService,
		@IConfigurationService private configurationService: IConfigurationService,
		// @IEnvironmentService private environmentService: IEnvironmentService,
		// @IConfigurationService private configurationService: IConfigurationService,
		@IProgressService2 private progressService: IProgressService2,
		@IStatusbarService private statusbarService: IStatusbarService,
	) {
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
		if (is64Bit) {
			this.arch = '64';
		} else {
			this.arch = '32';
		}

		this.localConfigFile = this.nodePathService.getPackagesPath('versions.json');
	}

	public get hasError(): boolean {
		return !!this._error;
	}

	protected async writeCache(name: string, value: string) {
		this.localPackage[name] = value;
		await writeFile(this.localConfigFile, JSON.stringify(this.localPackage, null, 4));
	}

	run(): TPromise<void> {
		const entry = this.statusbarService.setStatusMessage('$(sync~spin) Updating packages... please wait...');
		return this._run().then(() => {
			entry.dispose();
		}, (error) => {
			entry.dispose();
			this.statusbarService.setStatusMessage('$(sync~spin)$(x) Failed to download required packages, please check your internet connection...');
			this._error = error;
			this._onDidChangeState.fire(true);
			alert('Maix Cannot start:\n' + error.message);
			throw error;
		});
	}

	protected async _run(): TPromise<void> {
		const needUpdate = await this._checkUpdate();

		if (!needUpdate.length) {
			console.log('%c%s', 'color:green', 'no packages update needed.');
			return;
		}
		console.log('%c%s', 'color:orange', 'packages update: ', needUpdate);
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
		progress(null, project);

		const installTarget = this.nodePathService.getPackagesPath(project);
		if (await exists(installTarget)) {
			await emptyDir(installTarget);
		} else {
			await mkdirp(installTarget);
		}

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

		if (await exists(this.localConfigFile)) {
			this.localPackage = JSON.parse(await readFile(this.localConfigFile, 'utf8'));
		}

		const list = await this.getPackageList();
		for (const project of list) {
			if (project.toLowerCase() === 'maixide') {
				continue;
			}
			const remoteVersion = await this.getPackage(project);
			if (this.localPackage.hasOwnProperty(project) && remoteVersion.version === this.localPackage[project]) {
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

			needUpdate.push({
				downloadUrl,
				project,
				version: remoteVersion.version,
			});
		}
		return needUpdate;
	}

	protected async getPackage(packageName: string): TPromise<IPackageVersion> {
		const req: IRequestOptions = { type: 'GET', url: resolveUrl(distributeUrl, 'projects/' + packageName + '.json') };
		const res = await this.requestService.request(req);
		return await asJson<IPackageVersion>(res);
	}

	protected getPackageList(): TPromise<string[]> {
		const req: IRequestOptions = { type: 'GET', url: resolveUrl(distributeUrl, 'projects.lst') };
		return this.requestService.request(req).then(asText).then((content) => {
			return content.split(/\n/g).map(e => e.trim()).filter(e => e.length > 0);
		});
	}

	protected async downloadAndExtract(project: string, remoteVersion: string, downloadUrl: string, installTarget: string, progress: IProgressFn) {
		const zipFile = await this.download(project, remoteVersion, downloadUrl, installTarget, progress);
		progress(null, 'extracting files...');
		await this.extract(zipFile, installTarget);
	}

	protected async download(project: string, version: string, downloadUrl: string, installTarget: string, progress: IProgressFn) {
		const u = parse(downloadUrl);
		const ext = extname(u.pathname) || '.invalid';
		const hash = (u.hash || '').replace(/^#/, '');
		const targetFile = installTarget + '-' + version + ext;
		const partFile = targetFile + '.partial';

		if (await exists(targetFile)) {
			return targetFile;
		}

		const config: IHTTPConfiguration = this.configurationService.getValue<IHTTPConfiguration>();

		const proxyUrl = config.http && config.http.proxy;
		const strictSSL = config.http && config.http.proxyStrictSSL;
		const authorization = config.http && config.http.proxyAuthorization;

		const headers = {
			'user-agent': 'maix-ide, Visual Studio Code, Chrome',
		};
		if (authorization) {
			assign(headers, { 'Proxy-Authorization': authorization });
		}

		const agent = await getProxyAgent(downloadUrl, { proxyUrl, strictSSL });
		console.info(downloadUrl);
		const request = get(downloadUrl, {
			agent,
			strictSSL,
			followAllRedirects: true,
			headers,
		});

		const requestState = request_progress(request, {});

		requestState.on('progress', (state: ProgressReport) => {
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
				resolve();
			});
			requestState.pipe(createWriteStream(partFile));
		});

		if (hash) {
			const downloadedHash = (await this.hashFile(partFile)).toLowerCase();
			if (downloadedHash !== hash.toLowerCase()) {
				unlink(partFile);
				throw new Error(`Cannot install ${project}: hash mismatch.`);
			}
		}

		await move(partFile, targetFile);
		return targetFile;
	}

	private async hashFile(file: string) {
		return crypto.createHash('md5').update(await readFile(file)).digest('hex');
	}

	private async extract(zipFile: string, installTarget: string) {
		await mkdirp(installTarget + '.unzip');
		const outFile = await decompress(zipFile, installTarget + '.unzip');
		if (outFile.length === 0) {
			unlink(zipFile);
			throw new Error('Cannot decompress: download file invalid.');
		}

		if (await exists(installTarget)) {
			await emptyDir(installTarget);
			await rmdir(installTarget);
		}

		await move(installTarget + '.unzip', installTarget);
	}
}

registerSingleton(IPackagesUpdateService, PackagesUpdateService);
