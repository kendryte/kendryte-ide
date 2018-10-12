import { TPromise } from 'vs/base/common/winjs.base';
import { IUpdateService, State, StateType, UpdateType } from 'vs/platform/update/common/update';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import Severity from 'vs/base/common/severity';
import { Emitter, Event } from 'vs/base/common/event';
import { resolvePath } from 'vs/kendryte/vs/platform/node/resolvePath';
import packageJson from 'vs/platform/node/package';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { simpleProgressTranslate } from 'vs/kendryte/vs/platform/common/progress';
import { INodeFileSystemService, INodePathService } from 'vs/kendryte/vs/platform/common/type';
import { getUpdateLogger } from 'vs/kendryte/vs/services/update/common/ids';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';

const patchVersionKey = 'hot-patch-version'; // must same with electron main

const UPDATE_KEY_MAIN = 'KendryteIDE';
const UPDATE_KEY_PATCH = 'KendryteIDEPatch';

class SelfUpdateService implements IUpdateService {
	_serviceBrand: any;

	private readonly logger: IChannelLogger;

	private readonly _onStateChange: Emitter<State> = new Emitter<State>();
	public readonly onStateChange: Event<State> = this._onStateChange.event;

	private _state: State = State.Uninitialized;
	private downloaded: string;

	constructor(
		@INodePathService private readonly nodePathService: INodePathService,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@IStorageService private readonly storageService: IStorageService,
		@IWindowsService private readonly windowsService: IWindowsService,
		@IFileCompressService private readonly fileCompressService: IFileCompressService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		this.logger = getUpdateLogger(channelLogService);
	}

	public get state() {
		return this._state;
	}

	protected setState(state: State): void {
		this.logger.info('update#setState(%s)', state.type);
		this._state = state;
		this._onStateChange.fire(state);
	}

	public async applyUpdate(): TPromise<void> {
		this.channelLogService.show(this.logger.id);
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
		const targetFolder = await this.fileCompressService.extractTemp(patchZip, this.logger);


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
		this.storageService.store('workbench.panel.pinnedPanels', '[]', StorageScope.GLOBAL);

		await this.running; // if run(), this is promise, otherwise, is null
		delete this.runPromise; // if run(), runPromise = this.running + Promise(current function self), so this will never resolve or reject.
		// if (check update) runPromise = null

		this.disShutdown.dispose(); // prevent alert "do you really want to quit??"

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

registerSingleton(IUpdateService, SelfUpdateService);
