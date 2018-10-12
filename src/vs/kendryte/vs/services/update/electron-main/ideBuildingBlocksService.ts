import { TPromise } from 'vs/base/common/winjs.base';
import { resolve as resolveUrl } from 'url';
import { IIDEBuildingBlocksService, INodePathService, UpdateList, UpdateListConfirmed } from 'vs/kendryte/vs/platform/common/type';
import { exists, readFile, unlink, writeFile } from 'vs/base/node/pfs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as crypto from 'crypto';
import { dumpDate } from 'vs/kendryte/vs/platform/common/dumpDate';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IBuildingBlocksUpdateInfo, REQUIRED_BLOCK_DISTRIBUTE_URL } from 'vs/kendryte/vs/services/update/common/protocol';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { VersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { MainVersionUrlHandler } from 'vs/kendryte/vs/services/update/electron-main/mainVersionUrlHandler';
import { buffer, Emitter } from 'vs/base/common/event';

const STORAGE_KEY = 'block-update';

const LAST_UPDATE_CACHE_KEY = STORAGE_KEY + '-last-update';

class IDEBuildingBlocksService implements IIDEBuildingBlocksService {
	public _serviceBrand: any;

	private running: TPromise<UpdateList>;
	private bundledVersions: { [packageName: string]: string };
	private versionHandler: VersionUrlHandler;

	private readonly _onProgress = new Emitter<string>();
	private currentStatus: string = '';

	constructor(
		@IStorageService private storageService: IStorageService,
		@INodePathService private nodePathService: INodePathService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@INodeDownloadService private downloadService: INodeDownloadService,
	) {
		lifecycleService.onWillShutdown((e) => {
			if (this.bundledVersions) {
				const packageBundleFile = this.nodePathService.getPackagesPath('bundled-versions.json');
				const p = writeFile(packageBundleFile, JSON.stringify(this.bundledVersions, null, 4)).then(() => false);
				e.veto(p);
			}
		});

		this.versionHandler = instantiationService.createInstance(MainVersionUrlHandler);
	}

	public get onProgress() {
		return buffer(this._onProgress.event, false, [this.currentStatus]);
	}

	private setMessage(msg: string) {
		this.currentStatus = msg;
		this._onProgress.fire(msg);
	}

	markUpdate(data: UpdateListConfirmed): TPromise<void> {
		const packageUpdateMarker = this.nodePathService.tempDir('update-mark.json');
		return writeFile(packageUpdateMarker, JSON.stringify(data));
	}

	public fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		if (!this.running) {
			this.running = this._fetchUpdateInfo(logger, force).then((r) => {
				delete this.running;
				return r;
			}, (e) => {
				delete this.running;
				throw e;
			});
		}
		return this.running;
	}

	private async _fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		if (await this.isUpdateAlreadyCheckedMomentsAgo(logger)) {
			return [];
		}

		this.setMessage('fetching registry...');

		const packageBundleFile = this.nodePathService.getPackagesPath('bundled-versions.json');
		if (await exists(packageBundleFile)) {
			this.bundledVersions = JSON.parse(await readFile(packageBundleFile, 'utf8'));
		}

		const id = await this.downloadService.downloadTemp(resolveUrl(REQUIRED_BLOCK_DISTRIBUTE_URL, 'projects.json'));
		const file = await this.downloadService.waitResultFile(id);
		const content: IBuildingBlocksUpdateInfo[] = JSON.parse(await readFile(file, 'utf8'));

		const needUpdate: UpdateList = [];
		for (const packageData of content) {
			if (packageData.version === this.currentVersion(packageData.project)) {
				continue;
			}

			this.setMessage(`checking ${packageData.project}... (${needUpdate.length + 1}/${content.length})`);
			const downloadUrl = this.versionHandler.getMyVersion(packageData);
			const downloadId = await this.downloadService.downloadTemp(downloadUrl);

			needUpdate.push([packageData.project, downloadId]);
		}
		return needUpdate;
	}

	private currentVersion(blockName: string) {
		return this.storageService.get(STORAGE_KEY + blockName, StorageScope.GLOBAL, '') || this.bundledVersions[blockName] || '';
	}

	protected async checkHashIfKnown(hash: string, file: string, logger: IChannelLogger) {
		const alreadyExists = await exists(file);
		if (hash && alreadyExists) {
			const downloadedHash = (await this.hashFile(file)).toLowerCase();
			if (downloadedHash !== hash.toLowerCase()) {
				logger.error('hash invalid!\nexpect: %s\ngot   : %s', hash.toLowerCase(), downloadedHash);
				unlink(file);
				return false;
			}
			logger.info('hash check pass.');
			return true;
		} else {
			if (alreadyExists) {
				logger.info('hash is not set, skip check.');
			}
			return alreadyExists;
		}
	}

	protected async hashFile(file: string) {
		return crypto.createHash('md5').update(await readFile(file)).digest('hex');
	}

	protected async isUpdateAlreadyCheckedMomentsAgo(logger: IChannelLogger): TPromise<boolean> {
		const lastUpdate = this.storageService.getInteger(LAST_UPDATE_CACHE_KEY, StorageScope.GLOBAL, -1);
		if (lastUpdate <= 0) {
			logger.info('update has never checked');
			return false;
		}
		const lastDate = new Date(lastUpdate);
		logger.info('last update checked: %s', dumpDate.time(lastDate));
		if (isNaN(lastDate.getTime())) {
			logger.info('update time invalid');
			return false;
		}

		const mustRecheck = lastDate;
		mustRecheck.setHours(mustRecheck.getMinutes() + 15);
		logger.info('next update check: %s', dumpDate.time(mustRecheck));
		return (new Date) <= mustRecheck;
	}
}

registerMainSingleton(IIDEBuildingBlocksService, IDEBuildingBlocksService);
