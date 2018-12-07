import 'vs/kendryte/vs/services/update/electron-main/mainVersionUrlHandler';
import { IUpdateService, State, UpdateType } from 'vs/platform/update/common/update';
import { AbstractSelfUpdateService, IUpdateUserInterface } from 'vs/kendryte/vs/services/update/node/selfUpdateService';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IVersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IRequestService } from 'vs/platform/request/node/request';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { OpenKendryteReleasePageAction } from 'vs/kendryte/vs/services/update/node/openReleasePageAction';
import { IIDEUpdateInfo } from 'vs/kendryte/vs/services/update/common/protocol';
import { localize } from 'vs/nls';
import { IRelaunchRenderService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';

class SelfUpdateMainService extends AbstractSelfUpdateService {
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
		@IDialogService private readonly dialogService: IDialogService,
	) {
		super(versionHandler, environmentService, storageService, relaunchService, nodePathService, requestService, downloadService, fileCompressService);
		this.logger = instantiationService.invokeFunction((access) => {
			return access.get(ILogService);
		});

		if (!this.isDisable('initializing')) {
			this.setState(State.Idle(UpdateType.Archive));
		}
	}

	getUserInterface(): IUpdateUserInterface {
		return {
			error(e: Error) { },
			message(m: string) { },
			start() { },
			progress<T>(patch: T, number: number, patches: T[]) { },
			finish() { },
		};
	}

	notifyError(action: string, e: Error) {
		return this.dialogService.show(Severity.Error, `Failed to ${action}: ` + e.message, []);
	}

	async notifyReleaseUpdate(result: IIDEUpdateInfo) {
		const open = new OpenKendryteReleasePageAction(
			OpenKendryteReleasePageAction.ID,
			OpenKendryteReleasePageAction.LABEL,
			this.versionHandler.getIDEHomePage(result),
		);

		const message = localize('too.old', ' Your IDE is old, please reinstall a newer one.');

		await this.dialogService.show(Severity.Error, message, [
				open.label,
				localize('cancel', 'Cancel'),
			], { cancelId: -1 },
		).then((selected) => {
			this.logger.info('selected:', selected);
			if (selected === 0) {
				return open.run();
			} else {
				return Promise.resolve();
			}
		});
	}

	async notifyUpdateAvailable(): Promise<void> {
		await this.dialogService.show(Severity.Info, localize('KendryteIDE.isupdated', 'Kendryte IDE has updated, download now?'), [
			localize('yes.now', 'Yes, download now'),
			localize('later', 'Later'),
		], { cancelId: -1 }).then((selected) => {
			this.logger.info('selected:', selected);
			if (selected === 0) {
				return this._applyUpdate(true);
			} else {
				return undefined;
			}
		});
	}

	async askInstall() {
		return await this.dialogService.show(Severity.Error, localize('KendryteIDE.install-restart', 'Update downloaded, install and restart?'), [
			localize('yes.doit', 'Yes, do it'),
			localize('later', 'Later'),
		], { cancelId: -1 }).then((selected) => {
			this.logger.info('selected:', selected);
			return selected === 0;
		});
	}
}

registerMainSingleton(IUpdateService, SelfUpdateMainService);
