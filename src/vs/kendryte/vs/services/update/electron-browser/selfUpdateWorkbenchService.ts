import { IUpdateService } from 'vs/platform/update/common/update';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { AbstractSelfUpdateService, IUpdateUserInterface } from 'vs/kendryte/vs/services/update/node/selfUpdateService';
import 'vs/kendryte/vs/services/update/electron-browser/renderVersionUrlHandler';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { INotificationHandle, INotificationService } from 'vs/platform/notification/common/notification';
import { getUpdateLogger } from 'vs/kendryte/vs/services/update/common/ids';
import { IVersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IRequestService } from 'vs/platform/request/node/request';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { ILogService } from 'vs/platform/log/common/log';
import Severity from 'vs/base/common/severity';
import { IDisposable } from 'vs/base/common/lifecycle';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { OpenKendryteReleasePageAction } from 'vs/kendryte/vs/services/update/node/openReleasePageAction';
import { localize } from 'vs/nls';
import { IIDEUpdateInfo } from 'vs/kendryte/vs/services/update/common/protocol';
import { Action } from 'vs/base/common/actions';
import { IRelaunchRenderService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';

class SelfUpdateWorkbenchService extends AbstractSelfUpdateService {
	logger: ILogService;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IVersionUrlHandler versionHandler: IVersionUrlHandler,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IStorageService storageService: IStorageService,
		@IRelaunchRenderService relaunchService: IRelaunchRenderService,
		@INodePathService nodePathService: INodePathService,
		@IRequestService requestService: IRequestService,
		@INodeDownloadService downloadService: INodeDownloadService,
		@IFileCompressService fileCompressService: IFileCompressService,
		@IChannelLogService channelLogService: IChannelLogService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(versionHandler, environmentService, storageService, relaunchService, nodePathService, requestService, downloadService, fileCompressService);
		this.logger = getUpdateLogger(channelLogService);
	}

	getUserInterface(): IUpdateUserInterface {
		let info: { revoke: () => void } & IDisposable & INotificationHandle;
		return {
			error(e: Error) {
				info.updateSeverity(Severity.Error);
				info.updateMessage(e);
				info.revoke();
			},
			message(m: string) {
				info.updateMessage(m);
			},
			start: () => {
				if (!info) {
					info = unClosableNotify(this.notificationService, {
						severity: Severity.Info,
						message: 'update...',
					});
					info.progress.infinite();
				}
			},
			progress<T>(patch: T, current: number, patches: T[]) {
				info.updateMessage(`Downloading update: ${patch}... (${current} of ${patches.length})`);
			},
			finish() {
				info.dispose();
			},
		};
	}

	notifyError(action: string, e: Error) {
		return this.notificationService.error(`Failed to ${action}: ` + e.message);
	}

	notifyReleaseUpdate(result: IIDEUpdateInfo) {
		return new Promise<void>((resolve, reject) => {
			const h = this.notificationService.notify({
				severity: Severity.Error,
				message: localize('too.old', ' Your IDE is old, please reinstall a newer one.'),
				actions: {
					primary: [
						new Action(OpenKendryteReleasePageAction.ID, OpenKendryteReleasePageAction.LABEL, '', true, () => {
							resolve();
							return new OpenKendryteReleasePageAction(
								OpenKendryteReleasePageAction.ID,
								OpenKendryteReleasePageAction.LABEL,
								this.versionHandler.getIDEHomePage(result),
							).run();
						}),
						new Action('cancel', localize('cancel', 'Cancel'), '', true, async () => resolve()),
					],
				},
				sticky: true,
			});
			h.onDidClose(() => {
				resolve();
			});
		});
	}

	notifyUpdateAvailable() {
		return new Promise<void>((resolve, reject) => {
			const h = this.notificationService.notify({
				severity: Severity.Info,
				message: localize('KendryteIDE.isupdated', 'Kendryte IDE has updated, download now?'),
				actions: {
					primary: [
						new Action('yes', localize('yes.now', 'Yes, download now'), '', true, async () => {
							await this._applyUpdate(true); // apply will auto download
							resolve();
						}),
						new Action('no', localize('later', 'Later'), '', true, async () => resolve()),
					],
				},
				sticky: true,
			});
			h.onDidClose(() => {
				resolve();
			});
		});
	}

	async askInstall() {
		return new Promise<boolean>((resolve, reject) => {
			const h = this.notificationService.notify({
				severity: Severity.Info,
				message: localize('KendryteIDE.install-restart', 'Update downloaded, install and restart?'),
				actions: {
					primary: [
						new Action('yes', localize('yes.doit', 'Yes, do it'), '', true, async () => resolve(true)),
						new Action('no', localize('later', 'Later'), '', true, async () => resolve(false)),
					],
				},
				sticky: true,
			});

			h.onDidClose(() => {
				resolve(false);
			});
		});
	}
}

registerSingleton(IUpdateService, SelfUpdateWorkbenchService);
