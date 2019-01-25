import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { assumeWorkbench } from 'vs/kendryte/vs/workbench/packageManager/browser/assumeWorkbench';
import {
	ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
	ACTION_ID_PACKAGE_MANAGER_INSTALL_SINGLE_DEPENDENCY,
	ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
} from 'vs/kendryte/vs/base/common/menu/packageManager';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';

export class InstallDependencyAction extends Action {
	public static readonly ID = ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY;
	public static readonly LABEL = ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY;

	constructor(
		id: string = InstallDependencyAction.ID,
		label: string = InstallDependencyAction.LABEL,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
	) {
		super(id, label);
	}

	public run(event?: any): TPromise<void> {
		if (!this.instantiationService.invokeFunction(assumeWorkbench)) {
			return TPromise.as(null);
		}
		return this.packageRegistryService.installAll();
	}
}

export class InstallSingleDependencyAction extends Action {
	constructor(
		label: string,
		private readonly selection: boolean,
		private readonly packageInfo: IRemotePackageInfo,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private notificationService: INotificationService,
		@IQuickInputService private quickInputService: IQuickInputService,
	) {
		super(
			ACTION_ID_PACKAGE_MANAGER_INSTALL_SINGLE_DEPENDENCY,
			label,
		);
	}

	public async run(event?: any): TPromise<void> {
		if (!this.instantiationService.invokeFunction(assumeWorkbench)) {
			return TPromise.as(null);
		}
		let version: string;
		if (this.selection) {
			const sel = await this.quickInputService.pick(this.packageInfo.versions.map((v) => {
				let relInfo: string = '';
				try {
					const d = new Date(v.releaseDate);
					relInfo = 'Released at ' + d.toLocaleString();
				} catch (e) {
				}

				return {
					id: v.versionName,
					label: v.versionName,
					description: relInfo,
				};
			}), { placeHolder: 'Select version to install' });
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
