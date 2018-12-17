import { registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { Action } from 'vs/base/common/actions';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import { KENDRYTE_ACTIONID_BOOTSTRAP } from 'vs/kendryte/vs/platform/vscode/common/actionId';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { OpenDevToolsAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/openDevToolsAction';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { MaixBuildSystemPrepare } from 'vs/kendryte/vs/workbench/cmake/electron-browser/maixBuildSystemService';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { isMacintosh, isWindows } from 'vs/base/common/platform';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import * as electron from 'electron';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import Remote = Electron.Remote;

class KendryteBootstrapAction extends Action {
	public static readonly ID = KENDRYTE_ACTIONID_BOOTSTRAP;
	public static readonly LABEL = localize('internal.action', 'Internal Action');

	constructor(
		id: string = KendryteBootstrapAction.ID, label: string = KendryteBootstrapAction.LABEL,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ILogService private readonly logService: ILogService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@INotificationService private readonly notificationService: INotificationService,
		@IWindowService private readonly windowService: IWindowService,
		@IWindowsService private readonly windowsService: IWindowsService,
		@IKendryteClientService private readonly client: IKendryteClientService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IRelaunchService private readonly relaunchService: IRelaunchService,
	) {
		super(KENDRYTE_ACTIONID_BOOTSTRAP);

		if (!environmentService.isBuilt) {
			((electron as any).remote as Remote).getCurrentWebContents().openDevTools({ mode: 'detach' });
		}

		if (!process.env['VSCODE_PORTABLE']) { // for safe
			throw new Error('----- ERROR -----\n bootstrap.js is not ok. VSCODE_PORTABLE not set.\n----- ERROR -----');
		}

		lifecycleService.when(LifecyclePhase.Eventually).then(() => {
			debugger;
			this.relaunchService.notifySuccess();
		});
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
		await this.lifecycleService.when(LifecyclePhase.Ready);

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

		await this.lifecycleService.when(LifecyclePhase.Restored);
		if (await this.client.isMeFirst()) {
			this.logService.info('{update} I\'m first window in this session, start check extension update.');
			await this.extensions();
		} else {
			this.logService.info('{update} not first window, skip extension update progress');
		}

		this.logService.info('{update} {COMPLETE}');
		await this.lifecycleService.when(LifecyclePhase.Eventually);
		await this.activateCmake();
	}

	async run() {
		return this._run().catch((e) => {
			console.error(e);
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