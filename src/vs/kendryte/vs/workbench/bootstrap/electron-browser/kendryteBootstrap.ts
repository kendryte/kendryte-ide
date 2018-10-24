import { registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { Action } from 'vs/base/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import { KENDRYTE_ACTIONID_BOOTSTRAP } from 'vs/kendryte/vs/platform/vscode/common/actionId';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { OpenDevToolsAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/openDevToolsAction';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { ACTION_ID_IDE_SELF_UPGRADE, ACTION_ID_UPGRADE_BUILDING_BLOCKS } from 'vs/kendryte/vs/services/update/common/ids';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { MaixBuildSystemPrepare } from 'vs/kendryte/vs/workbench/cmake/electron-browser/maixBuildSystemService';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';

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
		@IWindowsService private readonly windowsService: IWindowsService,
		@IKendryteClientService private readonly client: IKendryteClientService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		super(KENDRYTE_ACTIONID_BOOTSTRAP);
	}

	private async ide_self() {
		this.logService.info('{update}', ACTION_ID_IDE_SELF_UPGRADE);
		const updated = await this.commandService.executeCommand(ACTION_ID_IDE_SELF_UPGRADE);
		if (updated) {
			this.logService.info('{update} will relaunch now');
			return true;
		}
		this.logService.info('{update}', ACTION_ID_IDE_SELF_UPGRADE, '{complete}');
		return false;
	}

	async packages() {
		this.logService.info('{update}', ACTION_ID_UPGRADE_BUILDING_BLOCKS);
		const packagesChanged = await this.commandService.executeCommand(ACTION_ID_UPGRADE_BUILDING_BLOCKS);
		if (packagesChanged) {
			this.logService.info('{update} will relaunch now');
			return;
		}
		this.logService.info('{update}', ACTION_ID_UPGRADE_BUILDING_BLOCKS, '{complete}');
	}

	async extensions() {
		this.logService.info('{update} Install Extensions');
		const extensionChanged = await this.instantiationService.invokeFunction(MaixBuildSystemPrepare);
		if (extensionChanged) {
			this.logService.info('{update} will relaunch now');
			this.windowsService.relaunch({});
			return;
		}
		this.logService.info('{update} Install Extensions {complete}');
	}

	async activateCmake() {
		this.instantiationService.invokeFunction((accessor) => accessor.get(ICMakeService));
	}

	async _run() {
		await this.lifecycleService.when(LifecyclePhase.Running);

		const hasPermInPackages = await this.nodeFileSystemService.tryWriteInFolder(this.nodePathService.getPackagesPath('test-perm'));
		const installingRoot = this.nodePathService.getSelfControllingRoot();
		if (!hasPermInPackages) {
			let platformMessage = '';
			if (isMacintosh) {
				if (/\/Downloads\//.test(installingRoot)) {
					platformMessage = 'please move IDE out from Downloads folder';
				} else {
					platformMessage = '"chown" is needed';
				}
			} else if (isWindows) {
				if (/c:\//i.test(installingRoot) && !/c:\/users\//i.test(installingRoot)) {
					platformMessage = 'do not place IDE in C:';
				} else {
					platformMessage = 'check your anti-virus program and "Safe" tab.';
				}
			} else {
				platformMessage = '"chown" is needed';
			}

			unClosableNotify(this.notificationService, {
				severity: Severity.Error,
				message: 'Kendryte IDE cannot write data on disk, ' + platformMessage,
				source: this.nodePathService.getPackagesPath(),
			});
			return;
		}

		if (await this.client.isMeFirst()) {
			this.logService.info('{update} I\'m first window in this session, start check self update.');
			if (await this.ide_self()) {
				return;
			}
			await this.packages();
			await this.extensions();
		} else {
			this.logService.info('{update} not first window, skip self update progress');
		}

		this.logService.info('{update} {COMPLETE}');
		await this.activateCmake();
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