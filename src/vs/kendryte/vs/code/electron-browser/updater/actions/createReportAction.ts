import { Action } from 'vs/base/common/actions';
import { ACTION_ID_REPORT_BUG, ACTION_LABEL_REPORT_BUG } from 'vs/kendryte/vs/base/common/menu/processTool';
import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { OpenUrlAction } from 'vs/kendryte/vs/platform/open/common/openUrlAction';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export class CreateReportAction extends Action {
	static readonly ID = ACTION_ID_REPORT_BUG;
	static readonly LABEL = ACTION_LABEL_REPORT_BUG;

	constructor(
		id: string = ACTION_ID_REPORT_BUG, label: string = ACTION_LABEL_REPORT_BUG,
		@IRelaunchService private readonly relaunchService: IRelaunchService,
		@ILogService private readonly logService: ILogService,
		@INotificationService private readonly notificationService: INotificationService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	async run() {
		this.logService.warn('create report');
		const file = await this.relaunchService.createLogsTarball();
		const handle = this.notificationService.notify({
			severity: Severity.Info,
			message: 'Your report is created, it\'s including your privacy data, please DO NOT send it to untrusted people.',
			actions: {
				primary: [
					this.instantiationService.createInstance(OpenUrlAction, 'Show', 'file://' + file),
				],
			},
		});

		return new Promise<void>((resolve, reject) => {
			handle.onDidClose(resolve);
		});
	}
}
