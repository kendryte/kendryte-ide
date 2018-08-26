import { IPackageVersion } from 'vs/workbench/parts/maix/cmake/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { asJson, asText, IRequestOptions } from 'vs/base/node/request';
import { resolve as resolveUrl } from 'url';
import { OperatingSystem, OS } from 'vs/base/common/platform';
import { is64Bit } from 'vs/workbench/parts/maix/_library/node/versions';
import { IRequestService } from 'vs/platform/request/node/request';
import { INodePathService } from 'vs/workbench/parts/maix/_library/node/nodePathService';
import { exists, mkdirp, readFile, writeFile } from 'vs/base/node/pfs';
import { emptyDir } from 'fs-extra';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IProgress } from 'vs/platform/progress/common/progress';

const distributeUrl = 'https://raw.githubusercontent.com/Canaan-Creative/release-registry/master/';

interface IUpdateStatus {
	project: string;
	version: string;
	downloadUrl: string;
}

export class MaixPackagesUpdate {
	private platform: string;
	private arch: string;
	private localPackage: {[packageName: string]: string} = {};
	private readonly localConfigFile: string;

	constructor(
		@IRequestService private requestService: IRequestService,
		@INodePathService private nodePathService: INodePathService,
		// @IEnvironmentService private environmentService: IEnvironmentService,
		// @IConfigurationService private configurationService: IConfigurationService,
		@IProgressService2 private progressService: IProgressService2,
		@INotificationService private notificationService: INotificationService,
		// @IStatusbarService private statusbarService: IStatusbarService,
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

	async writeCache(name: string, value: string) {
		this.localPackage[name] = value;
		await writeFile(this.localConfigFile, JSON.stringify(this.localPackage, null, 4));
	}

	async run() {
		const needUpdate = await this._checkUpdate();

		if (!needUpdate.length) {
			return;
		}
		return this.progressService.withProgress({
			location: ProgressLocation.Notification,
			title: 'updating',
			cancellable: false,
		}, async (reporter: IProgress<IProgressStep>) => {
			const r = needUpdate.length;
			const last = 0;
			let ok = 0;
			for (const item of needUpdate) {
				reporter.report({ message: item.project + '...' });
				await this._doUpdate(item, (p) => {
					const current = (100 / ok) + (p / r);
					const delta = current - last;
					reporter.report({ increment: delta });
				});
				ok++;
			}
		});
	}

	private async _doUpdate({ project, downloadUrl, version }: IUpdateStatus, progress: (current: number) => void) {
		const installTarget = this.nodePathService.getPackagesPath(project);
		if (await exists(installTarget)) {
			await emptyDir(installTarget);
		} else {
			await mkdirp(installTarget);
		}

		await this.downloadAndExtract(project, downloadUrl, installTarget);

		await this.writeCache(project, version);
	}

	private async _checkUpdate(): TPromise<IUpdateStatus[]> {
		const needUpdate: IUpdateStatus[] = [];
		if (this.platform) {
			throw new Error('Your platform is not supported.');
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
			if (!remoteVersion[this.platform]) {
				throw new Error('Your platform is not supported: ' + project);
			}

			if (remoteVersion.version === this.localPackage[project]) {
				continue;
			}

			const downloadUrl = remoteVersion[this.platform][this.arch] || remoteVersion[this.platform]['generic'];

			needUpdate.push({
				downloadUrl,
				project,
				version: remoteVersion.version,
			});
		}
		return needUpdate;
	}

	async getPackage(packageName: string): TPromise<IPackageVersion> {
		const req: IRequestOptions = { type: 'GET', url: resolveUrl(distributeUrl, 'projects/' + packageName + '.json') };
		const res = await this.requestService.request(req);
		return await asJson<IPackageVersion>(res);
	}

	getPackageList(): TPromise<string[]> {
		const req: IRequestOptions = { type: 'GET', url: resolveUrl(distributeUrl, 'projects.lst') };
		return this.requestService.request(req).then(asText).then((content) => {
			return content.split(/\n/g).map(e => e.trim()).filter(e => e.length > 0);
		});
	}

	async downloadAndExtract(project: string, downloadUrl: string, installTarget: string) {
	}
}
