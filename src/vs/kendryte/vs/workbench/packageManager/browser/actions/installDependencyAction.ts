import { Action } from 'vs/base/common/actions';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import {
	ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
	ACTION_ID_PACKAGE_MANAGER_INSTALL_SINGLE_DEPENDENCY,
	ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
} from 'vs/kendryte/vs/base/common/menu/packageManager';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { localize } from 'vs/nls';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';

export class InstallEveryDependencyAction extends Action {
	public static readonly ID = ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY;
	public static readonly LABEL = ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY;

	constructor(
		id: string = InstallEveryDependencyAction.ID,
		label: string = InstallEveryDependencyAction.LABEL,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	public run(): Promise<void> {
		return this.packageRegistryService.installAll().then(() => {
			this.notificationService.info(localize('installSuccess', 'All dependencies successfully installed.'));
		}, (e) => {
			this.notificationService.info(localize('installFail', 'Install failed: {0}', toErrorMessage(e)));
		});
	}
}

export class InstallProjectDependencyAction extends Action {
	public static readonly ID = ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY;
	public static readonly LABEL = ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY;

	constructor(
		id: string = InstallEveryDependencyAction.ID,
		label: string = InstallEveryDependencyAction.LABEL,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private notificationService: INotificationService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super(id, label);
	}

	public run(): Promise<void> {
		const dir = this.kendryteWorkspaceService.requireCurrentWorkspace();
		return this.packageRegistryService.installProject(dir).then(() => {
			this.notificationService.info(localize('installSuccessProject', 'Project dependencies successfully installed.'));
		}, (e) => {
			this.notificationService.info(localize('installFail', 'Install failed: {0}', toErrorMessage(e)));
		});
	}
}

export class InstallSingleDependencyAction extends Action {
	constructor(
		label: string,
		private readonly selection: boolean,
		private readonly packageInfo: IRemotePackageInfo,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private notificationService: INotificationService,
		@IQuickInputService private quickInputService: IQuickInputService,
	) {
		super(
			ACTION_ID_PACKAGE_MANAGER_INSTALL_SINGLE_DEPENDENCY,
			label,
		);
	}

	public async run(event?: any): Promise<void> {
		let version: string | undefined = undefined;
		if (this.selection) {
			const sel = await this.quickInputService.pick(this.packageInfo.versions.map((v) => {
				let relInfo: string = '';
				try {
					const d = new Date(v.releaseDate || NaN);
					relInfo = 'Released at ' + d.toLocaleString();
				} catch (e) {
				}

				return {
					id: v.versionName,
					label: v.versionName,
					description: relInfo,
				};
			}), { placeHolder: localize('selectVersion', 'Select version to install') });
			if (!sel) {
				return;
			}
			version = sel.id;
		}

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'Installing...',
			source: 'Package Manager',
		});
		handle.progress.infinite();
		return this.packageRegistryService.installDependency(this.packageInfo, version).then(() => {
			handle.progress.done();
			handle.dispose();
		}, (e) => {
			handle.revoke();
			handle.progress.done();
			handle.updateSeverity(Severity.Error);
			handle.updateMessage('Failed to install package: ' + e.message);
		});
	}
}
