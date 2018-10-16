import { resolve as resolveUrl } from 'url';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { INotificationHandle, INotificationService } from 'vs/platform/notification/common/notification';
import { Emitter, Event } from 'vs/base/common/event';
import { copy, rimraf } from 'vs/base/node/pfs';
import { IVersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { IRequestService } from 'vs/platform/request/node/request';
import { IDECurrentPatchVersion } from 'vs/kendryte/vs/services/update/node/myVersion';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { IDE_MAIN_DISTRIBUTE_URL, IIDEUpdateInfo } from 'vs/kendryte/vs/services/update/common/protocol';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import packageJson from 'vs/platform/node/package';
import { getUpdateLogger } from 'vs/kendryte/vs/services/update/common/ids';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import Severity from 'vs/base/common/severity';
import { CancellationToken } from 'vs/base/common/cancellation';
import { TPromise } from 'vs/base/common/winjs.base';
import { IUpdateService, State, StateType, UpdateType } from 'vs/platform/update/common/update';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { asJson } from 'vs/base/node/request';
import { IInstantiationService, optional } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IDisposable } from 'vs/base/common/lifecycle';

export class SelfUpdateService implements IUpdateService {
	_serviceBrand: any;

	private readonly logger: ILogService;

	private readonly _onStateChange: Emitter<State> = new Emitter<State>();
	public readonly onStateChange: Event<State> = this._onStateChange.event;

	private _state: State = State.Uninitialized;
	private downloaded: string;
	private cached: IIDEUpdateInfo;

	constructor(
		@IVersionUrlHandler private readonly versionHandler: IVersionUrlHandler,
		@IInstantiationService instantiationService: IInstantiationService,
		@optional(IChannelLogService) channelLogService: IChannelLogService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@IStorageService private readonly storageService: IStorageService,
		@IWindowsService private readonly windowsService: IWindowsService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IRequestService private readonly requestService: IRequestService,
		@INodeDownloadService private readonly downloadService: INodeDownloadService,
		@IFileCompressService private readonly fileCompressService: IFileCompressService,
		@optional(INotificationService) private readonly notificationService: INotificationService,
	) {
		if (channelLogService) {
			this.logger = getUpdateLogger(channelLogService);
		} else {
			this.logger = instantiationService.invokeFunction((access) => {
				return access.get(ILogService);
			});
		}
	}

	public get state() {
		return this._state;
	}

	protected setState(state: State): void {
		this.logger.info('kendryteUpdate#setState(%s)', state.type);
		this._state = state;
		this._onStateChange.fire(state);
	}

	public async isLatestVersion(): TPromise<boolean | undefined> {
		if (!this.environmentService.isBuilt) {
			this.logger.info('KendryteIDE update disabled (dev mode): %s', packageJson.version);
			return true;
		}
		const result = await this.checkUpdateInfo(true);
		if (result.version !== packageJson.version) {
			await this.notifyUpdate();
			return false;
		}
		const patches = this.versionHandler.getPatchList(result);
		if (patches.length > 0) {
			const patch = patches[patches.length - 1];
			this.setState(State.AvailableForDownload({
				version: patch.version.toString(),
				productVersion: patch.version.toString(),
			}));
			return false;
		}

		this.setState(State.Idle(UpdateType.Archive));

		// todo: notify
		return false;
	}

	public async checkForUpdates(context: any): TPromise<void> {
		this.setState(State.Uninitialized);
		if (!this.environmentService.isBuilt) {
			this.logger.info('KendryteIDE update disabled (dev mode): %s', packageJson.version);
			return;
		}

		this.setState(State.CheckingForUpdates({}));

		const result: IIDEUpdateInfo = await this.checkUpdateInfo();
		if (result.version === packageJson.version) {
			this.logger.info('Base environment is up to date: [%s].', result.version);

			const patches = await this.versionHandler.getPatchList(result);
			if (patches.length === 0) {
				this.logger.info('KendryteIDE is up to date: [%s].', IDECurrentPatchVersion());
				this.setState(State.Idle(UpdateType.Archive));
				return;
			} else {
				this.logger.warn('KendryteIDE is update: local %s, remote:\n%s', IDECurrentPatchVersion(), patches.toString());
				await this.downloadUpdate();
				await this.applyUpdate();
				await this.quitAndInstall();
			}
		} else {
			await this.notifyUpdate();
		}
	}

	public async downloadUpdate(): TPromise<void> {
		if (this._state.type === StateType.Downloading) {
			throw new Error('update is in progress...');
		}

		const result = await this.checkUpdateInfo(false);
		if (result.version !== packageJson.version) {
			throw new Error('Newer release is required...');
		}
		const patches = await this.versionHandler.getPatchList(result);

		let info: { revoke: () => void } & IDisposable & INotificationHandle;
		if (this.notificationService) {
			info = unClosableNotify(this.notificationService, {
				severity: Severity.Info,
				message: 'update...',
			});
			info.progress.infinite();
		}

		const tempUpdateContents = await this.nodePathService.ensureTempDir('update-content');
		this.logger.info('files will extract to:', tempUpdateContents);
		this.logger.warn('    rimraf()');
		await rimraf(tempUpdateContents);

		let lastInfo;
		try {
			for (const patch of patches) {
				if (this.notificationService) {
					info.updateMessage('Downloading update: ' + patch + '...');
				}

				lastInfo = {
					version: patch.version.toString(),
					productVersion: patch.version.toString(),
				};
				this.setState(State.Downloading(lastInfo));

				this.logger.info('download file from:\n  ', patch.downloadUrl);
				const id = await this.downloadService.downloadTemp(patch.downloadUrl);
				const zipFile = await this.downloadService.waitResultFile(id);
				this.logger.info('extract file:');
				const extracted = await this.fileCompressService.extractTemp(zipFile, this.logger);
				this.logger.info('  extracted:', extracted);

				this.logger.info('  copy to ', tempUpdateContents);
				await copy(extracted, tempUpdateContents);
				this.logger.warn('  rimraf: ', extracted);
				await rimraf(extracted);
			}

			if (this.notificationService) {
				info.close();
			}

			this.setState(State.Downloaded(lastInfo));
			this.downloaded = tempUpdateContents;
		} catch (e) {
			this.setState(State.AvailableForDownload(lastInfo));
			this.logger.error('(FAILED)', e.message);

			if (this.notificationService) {
				info.updateSeverity(Severity.Error);
				info.updateMessage(e);
				info.revoke();
			}
		}
	}

	public async applyUpdate(): TPromise<void> {
		if (!this.downloaded) {
			await this.downloadUpdate();
		}
		const patch = await this.checkUpdateInfo();
		this.setState(State.Updating({
			version: patch.version,
			productVersion: patch.version,
		}));

		const patchResultFolder = this.downloaded;
		const installTarget = resolvePath(this.nodePathService.getInstallPath(), 'resources/app');
		this.logger.info('applyIDEPatch:\n  From: %s\n  To: %s', patchResultFolder, installTarget);

		await copy(patchResultFolder, installTarget);

		this.setState(State.Ready({
			version: patch.version,
			productVersion: patch.version,
		}));
	}

	public async quitAndInstall(): TPromise<void> {
		this.storageService.store('workbench.panel.pinnedPanels', '[]', StorageScope.GLOBAL);
		await this.windowsService.relaunch({});
	}

	protected async notifyUpdate() {
		const result = await this.checkUpdateInfo(false);
		this.logger.warn('Base environment is update: local %s, remote %s', packageJson.version, result.version);

		this.setState(State.AvailableForDownload({
			version: result.version,
			productVersion: result.version,
			supportsFastUpdate: false,
			url: this.versionHandler.getIDE(result),
		}));

		/*this.notificationService.prompt(Severity.Info, 'KendryteIDE has updated.\n', [
			new OpenKendryteReleasePageAction(this.versionHandler.getIDEHomePage(result)),
		]);*/
	}

	protected async checkUpdateInfo(force: boolean = true): TPromise<IIDEUpdateInfo> {
		if (force || !this.cached) {
			const url = resolveUrl(IDE_MAIN_DISTRIBUTE_URL + '/', 'IDE.json');
			this.logger.info('checking update from ' + url + '.');
			this.cached = await this.requestService.request({ type: 'GET', url: url }, CancellationToken.None).then(asJson) as any;
		}
		return this.cached;
	}
}
