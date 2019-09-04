import { Action, ITelemetryData } from 'vs/base/common/actions';
import { ACTION_ID_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import Constants from 'vs/workbench/contrib/markers/browser/constants';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { localize } from 'vs/nls';

export class MaixCMakeBuildAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD;
	protected outputChannel: IOutputChannel;

	static lastBuildError: INotificationHandle;

	constructor(
		id = MaixCMakeBuildAction.ID, label = MaixCMakeBuildAction.LABEL,
		@IOutputService private readonly outputService: IOutputService,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@INotificationService private readonly notificationService: INotificationService,
		@ITextFileService private readonly textFileService: ITextFileService,
		@IPanelService private readonly panelService: IPanelService,
	) {
		super(id, label);
		this.outputChannel = assertNotNull(outputService.getChannel(CMAKE_CHANNEL));
	}

	async run(completeShowMessage?: boolean, event?: ITelemetryData) {
		MaixCMakeBuildAction.closeError();
		let successMessage = completeShowMessage === undefined ? true : completeShowMessage;
		let stopPropagateError = successMessage;
		if (event && (event.from === 'keybinding' || event.from === 'menu')) {
			stopPropagateError = true;
		}
		// await this.outputService.showChannel(CMAKE_CHANNEL, true);
		return this._run().then((result) => {
			if (successMessage) {
				MaixCMakeBuildAction.lastBuildError = this.notificationService.notify({
					severity: Severity.Info,
					message: localize('buildSuccess', 'Build complete. (' + result.warnings + ' warnings)'),
					actions: {
						primary: [
							new Action('showLog', localize('showLogShort', 'Log'), '', true, () => this.showLogWindow()),
							new Action('close', localize('dismiss', 'Dismiss'), '', true, async () => MaixCMakeBuildAction.closeError()),
						],
					},
				});
			}
		}, (e) => {
			// debugger;
			this.outputChannel.append('\n[ERROR] Build failed.\n');
			this.outputChannel.append(`${e.stack || e.message}\n`);
			this.outputChannel.append('[ERROR] Build failed.\n');
			// this.outputService.showChannel(CMAKE_CHANNEL, true);
			this.panelService.openPanel(Constants.MARKERS_PANEL_ID, true);

			if (stopPropagateError) {
				MaixCMakeBuildAction.lastBuildError = this.notificationService.notify({
					severity: Severity.Error,
					message: localize('buildFail', 'Build failed: ') + toErrorMessage(e),
					actions: {
						primary: [
							new Action('showLog', localize('showLog', 'Show me the log'), '', true, () => this.showLogWindow()),
							new Action('close', localize('dismiss', 'Dismiss'), '', true, async () => MaixCMakeBuildAction.closeError()),
						],
					},
				});
			} else {
				throw e;
			}
		});
	}

	static closeError() {
		if (MaixCMakeBuildAction.lastBuildError) {
			MaixCMakeBuildAction.lastBuildError.close();
			delete MaixCMakeBuildAction.lastBuildError;
		}
	}

	async _run() {
		this.outputChannel.clear();
		this.outputChannel.append(`\`\`\`\nStarting build... time: ${new Date()}\n`);

		await this.textFileService.saveAll();

		await this.cmakeService.configure();

		this.outputChannel.append('\n===================\n\n');

		const result = await this.cmakeService.build();

		this.outputChannel.append('\nBuild complete. (' + result.warnings + ' warnings)');

		return result;
	}

	private showLogWindow() {
		return this.outputService.showChannel(this.outputChannel.id);
	}
}
