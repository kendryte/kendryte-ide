import { resolve as resolveUrl } from 'url';
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
import { CancellationToken } from 'vs/base/common/cancellation';
import { TPromise } from 'vs/base/common/winjs.base';
import { AvailableForDownload, IUpdateService, State, StateType, UpdateType } from 'vs/platform/update/common/update';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { asJson } from 'vs/base/node/request';
import { ILogService } from 'vs/platform/log/common/log';
import { OpenKendryteReleasePageAction } from 'vs/kendryte/vs/services/update/node/openReleasePageAction';

export interface IUpdateUserInterface {
	error(e: Error): void;
	message(m: string): void;
	start(): void;
	progress<T>(patch: T, index: number, patches: T[]): void;
	finish(): void;
}

export abstract class AbstractSelfUpdateService implements IUpdateService {
	_serviceBrand: any;

	protected abstract readonly logger: ILogService;
	private _isLatestVersion: boolean | undefined;
	private _isReleaseUpdated: boolean;

	protected abstract notifyError(action: string, e: Error);

	protected abstract getUserInterface(): IUpdateUserInterface;

	protected abstract notifyReleaseUpdate(result: IIDEUpdateInfo): Promise<void>;

	protected abstract notifyUpdateAvailable(): Promise<void>;

	protected abstract askInstall(): Promise<boolean>;

	protected readonly _onStateChange: Emitter<State> = new Emitter<State>();
	public readonly onStateChange: Event<State> = this._onStateChange.event;

	protected _state: State = State.Uninitialized;
	protected downloaded: string;
	protected cached: IIDEUpdateInfo;

	constructor(
		@IVersionUrlHandler protected readonly versionHandler: IVersionUrlHandler,
		@IEnvironmentService protected readonly environmentService: IEnvironmentService,
		@IStorageService protected readonly storageService: IStorageService,
		@IWindowsService protected readonly windowsService: IWindowsService,
		@INodePathService protected readonly nodePathService: INodePathService,
		@IRequestService protected readonly requestService: IRequestService,
		@INodeDownloadService protected readonly downloadService: INodeDownloadService,
		@IFileCompressService protected readonly fileCompressService: IFileCompressService,
	) {
	}

	public get state() {
		return this._state;
	}

	protected setState(state: State): void {
		this.logger.info('⏳ kendryteUpdate#setState(%j)', state);
		this._state = state;
		this._onStateChange.fire(state);
	}

	protected setErrorState(e: Error): Error {
		if (!e) {
			e = new Error('Unknown Error');
		} else if (!e.message) {
			e = new Error(e as any);
		}
		this.setState(State.Idle(UpdateType.Archive, e.message));
		return e;
	}

	public isLatestVersion(): TPromise<boolean | undefined> {
		if (this.isDisable('isLatestVersion')) {
			return Promise.resolve(undefined);
		}

		return this.checkUpdateInfo().then((res) => {
			if (this._isReleaseUpdated) {
				this.notifyReleaseUpdate(res).catch();
			} else {
				this.notifyUpdateAvailable().catch();
			}
			return this._isLatestVersion;
		}).catch((e) => {
			this.notifyError('detecting update availability', e);
			return this._isLatestVersion;
		});
	}

	public checkForUpdates(context: any): TPromise<void> {
		if (this.isDisable('checkForUpdates')) {
			return Promise.resolve();
		}
		return this.checkUpdateInfo().then((res) => {
			if (this._isReleaseUpdated) {
				this.notifyReleaseUpdate(res).catch();
			} else {
				this.notifyUpdateAvailable().catch();
			}
		}, (e) => {
			this.notifyError('checking update info', e);
			throw e;
		});
	}

	public downloadUpdate(open = true): TPromise<void> {
		if (this.isDisable('downloadUpdate')) {
			return TPromise.wrapError(new Error('downloadUpdate: update is disabled'));
		}
		if (this._state.type === StateType.Downloading) {
			return TPromise.wrapError(new Error('update is in progress...'));
		}

		if (!this._isReleaseUpdated && !this._isLatestVersion && (this._state as AvailableForDownload).update) {
			const lastInfo = (this._state as AvailableForDownload).update;

			if (!lastInfo.supportsFastUpdate) {
				if (open) {
					this.logger.info('open browser to download new release.');
					return new OpenKendryteReleasePageAction(
						OpenKendryteReleasePageAction.ID,
						OpenKendryteReleasePageAction.LABEL,
						this.versionHandler.getIDEHomePage(this.cached),
					).run() as Promise<any>;
				} else {
					this.logger.info('download: release is update, need manual action.');
					return Promise.resolve();
				}
			}

			this.logger.info('confirmed to download.');
			this.setState(State.Downloading(lastInfo));
			const context = this.getUserInterface();
			context.start();

			return this._downloadUpdate(context, this.cached).then(() => {
				context.finish();
				this.setState(State.Downloaded(lastInfo));
			}, (e) => {
				e = this.setErrorState(e);
				// no need this.notifyError('checking update info', e);
				context.finish();
				throw e;
			});
		} else {
			this.logger.warn('nothing to download...');
		}
		return void 0;
	}

	private async _downloadUpdate(context: IUpdateUserInterface, result: IIDEUpdateInfo): Promise<void> {
		const patches = this.versionHandler.getPatchList(result);

		const tempUpdateContents = await this.nodePathService.ensureTempDir('update-content');
		this.logger.info('files will extract to:', tempUpdateContents);
		this.logger.warn('    rimraf( ^ )');
		await rimraf(tempUpdateContents);

		let i = 1;
		for (const patch of patches) {
			context.progress(patch, i++, patches);

			const downloadUrl = resolveUrl(IDE_MAIN_DISTRIBUTE_URL + '/', patch.downloadUrl);
			this.logger.info('download file from:\n  ', downloadUrl);
			const id = await this.downloadService.downloadTemp(downloadUrl, true, this.logger);
			const zipFile = await this.downloadService.waitResultFile(id);
			this.logger.info('extract file:');
			const extracted = await this.fileCompressService.extractTemp(zipFile, this.logger);
			this.logger.info('  extracted:', extracted);

			this.logger.info('  copy to ', tempUpdateContents);
			await copy(extracted, tempUpdateContents);
			this.logger.warn('  rimraf: ', extracted);
			await rimraf(extracted);
		}

		this.downloaded = tempUpdateContents;
		this.logger.warn(' ~ download complete!!!');
	}

	public applyUpdate(): TPromise<void> {
		if (this.isDisable('applyUpdate')) {
			return TPromise.wrapError(new Error('applyUpdate: update is disabled'));
		}

		return this._applyUpdate(false).then(() => void 0);
	}

	protected async _applyUpdate(auto: boolean): TPromise<boolean> {
		if (auto) {
			if (this.isDisable('applyAndQuitInstall')) {
				return TPromise.wrapError(new Error('applyUpdate: update is disabled'));
			}
		}

		if (!this.downloaded) {
			await this.downloadUpdate(false);
			if (!this.downloaded) {
				return false;
			}
		}

		try {
			const { version } = this.cached;
			this.setState(State.Updating({
				version: version,
				productVersion: version,
			}));

			const installTarget = resolvePath(this.nodePathService.getInstallPath(), 'resources/app');
			this.logger.info('applyIDEPatch:\n  From: %s\n  To: %s', this.downloaded, installTarget);

			await copy(this.downloaded, installTarget);

			if (auto) {
				if (await this.askInstall()) {
					await this.quitAndInstall();
				}
				return false;
			} else {
				this.setState(State.Ready({
					version: version,
					productVersion: version,
				}));
				return true;
			}
		} catch (e) {
			this.notifyError('apply update files', e);
			throw e;
		}
	}

	public async quitAndInstall(): TPromise<void> {
		if (this.isDisable('quitAndInstall')) {
			return TPromise.wrapError(new Error('quitAndInstall: update is disabled'));
		}
		this.storageService.store('workbench.panel.pinnedPanels', '[]', StorageScope.GLOBAL);
		if (process.env.DEBUG_MODE) {
			this.logger.warn('Debug mode detected, not auto restart.');
			return;
		}
		await this.windowsService.relaunch({});
	}

	protected async _notifyReleaseUpdate(result: IIDEUpdateInfo) {
		this.setState(State.AvailableForDownload({
			version: result.version,
			productVersion: result.version,
			supportsFastUpdate: false,
			url: this.versionHandler.getIDE(result),
		}));

		this.notifyReleaseUpdate(result).catch();
	}

	private checkingPromise: Promise<any>;

	protected checkUpdateInfo(force: boolean = false): Promise<IIDEUpdateInfo> {
		if (this.checkingPromise) {
			return this.checkingPromise;
		}
		if (force || !this.cached) {
			const url = resolveUrl(IDE_MAIN_DISTRIBUTE_URL + '/', 'IDE.json');
			this.logger.info('[IDE] checking update from ' + url + (force ? '(force)' : '') + '.');
			this.setState(State.CheckingForUpdates({}));
			return this.checkingPromise = this.requestService.request({ type: 'GET', url: url }, CancellationToken.None).then(asJson).then((result: IIDEUpdateInfo) => {
				delete this.checkingPromise;

				this.logger.info('result: ', result);

				if (result.version !== packageJson.version) {
					this.logger.info('[IDE] Base environment has update: local %s, remote: %s.', packageJson.version, result.version);
					this._isLatestVersion = false;
					this._isReleaseUpdated = true;
					this.setState(State.AvailableForDownload({
						version: result.version,
						productVersion: '',
						supportsFastUpdate: false,
						url: this.versionHandler.getIDEHomePage(result),
					}));
				} else {
					this.logger.info('[IDE] Base environment is up to date: [%s].', result.version);
					this._isReleaseUpdated = false;
					const patches = this.versionHandler.getPatchList(result);
					if (patches.length > 0) {
						this.logger.warn('[IDE] is update: local %s, remote: %s', IDECurrentPatchVersion(), patches[patches.length - 1].version);
						this._isLatestVersion = false;
						this.setState(State.AvailableForDownload({
							version: result.version,
							productVersion: patches[patches.length - 1].version.toString(),
							supportsFastUpdate: true,
						}));
					} else {
						this.logger.info('[IDE] is up to date: [%s].', IDECurrentPatchVersion());
						this._isLatestVersion = true;
						this.setState(State.Idle(UpdateType.Archive));
					}
				}

				return this.cached = result;
			}, (e) => {
				delete this.checkingPromise;

				this._isLatestVersion = void 0;
				this._isReleaseUpdated = void 0;
				throw this.setErrorState(e);
			});
		}
		return Promise.resolve(this.cached);
	}

	protected isDisable(method: string) {
		if (this.environmentService.isBuilt) {
			return false;
		} else {
			this.logger.info(method + ': KendryteIDE update disabled (dev mode): ' + packageJson.version);

			this.setState(State.Uninitialized);
			return true;
			// return false;
		}
	}
}
