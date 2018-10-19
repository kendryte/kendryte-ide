import { registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { Action } from 'vs/base/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import { KENDRYTE_ACTIONID_BOOTSTRAP } from 'vs/kendryte/vs/platform/vscode/common/actionId';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { OpenDevToolsAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/openDevToolsAction';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { ACTION_ID_IDE_SELF_UPGRADE, ACTION_ID_UPGRADE_BUILDING_BLOCKS } from 'vs/kendryte/vs/services/update/common/ids';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { MaixBuildSystemPrepare } from 'vs/kendryte/vs/workbench/cmake/electron-browser/maixBuildSystemService';

class KendryteBootstrapAction extends Action {
	public static readonly ID = KENDRYTE_ACTIONID_BOOTSTRAP;
	public static readonly LABEL = localize('internal.action', 'Internal Action');

	constructor(
		id: string = KendryteBootstrapAction.ID, label: string = KendryteBootstrapAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ILogService private readonly logService: ILogService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@ICommandService private readonly commandService: ICommandService,
		@INotificationService private readonly notificationService: INotificationService,
		@IWindowService private readonly windowService: IWindowService,
		@IKendryteClientService private readonly client: IKendryteClientService,
	) {
		super(KENDRYTE_ACTIONID_BOOTSTRAP);
	}

	async _run() {
		if (!await this.client.isMeFirst()) {
			this.logService.info('{update} not first window, skip update progress...');
			return;
		}
		this.logService.info('{update} I\'m first window in this session, start check update.');

		await this.lifecycleService.when(LifecyclePhase.Running);

		// ide itself
		this.logService.info('{update}', ACTION_ID_IDE_SELF_UPGRADE);
		const updated = await this.commandService.executeCommand(ACTION_ID_IDE_SELF_UPGRADE);
		if (updated) {
			this.logService.info('{update} will relaunch now');
			return;
		}
		this.logService.info('{update}', ACTION_ID_IDE_SELF_UPGRADE, '{complete}');

		// packages
		this.logService.info('{update}', ACTION_ID_UPGRADE_BUILDING_BLOCKS);
		const packagesChanged = await this.commandService.executeCommand(ACTION_ID_UPGRADE_BUILDING_BLOCKS);
		if (packagesChanged) {
			this.logService.info('{update} will relaunch now');
			return;
		}
		this.logService.info('{update}', ACTION_ID_UPGRADE_BUILDING_BLOCKS, '{complete}');

		// extensions
		this.logService.info('{update} Install Extensions');
		const extensionChanged = await this.instantiationService.invokeFunction(MaixBuildSystemPrepare);
		if (extensionChanged) {
			this.logService.info('{update} will reload now');
			this.windowService.reloadWindow();
			return;
		}
		this.logService.info('{update} Install Extensions {complete}');

		// ensure cmake service active
		this.instantiationService.invokeFunction((accessor) => accessor.get(ICMakeService));

		this.logService.info('{update} {COMPLETE}');
	}

	async run() {
		return this._run().catch((e) => {
			this.notificationService.notify({
				severity: Severity.Error,
				message: `Something goes wrong when starting IDE: ${e.message}`,
				actions: {
					primary: [
						new OpenDevToolsAction(OpenDevToolsAction.ID, OpenDevToolsAction.LABEL, this.windowService),
					],
				},
			});
		});
	}
}

registerInternalAction('internal', KendryteBootstrapAction);