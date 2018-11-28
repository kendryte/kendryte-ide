import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { assumeWorkbench } from 'vs/kendryte/vs/workbench/packageManager/browser/assumeWorkbench';
import { ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY, ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET } from 'vs/kendryte/vs/base/common/menu/packageManager';

export class InstallDependencyAction extends Action {
	public static readonly ID = ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY;
	public static readonly LABEL = ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET;

	constructor(
		id: string = InstallDependencyAction.ID,
		label: string = InstallDependencyAction.LABEL,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	public run(event: IRemotePackageInfo): TPromise<void> {
		if (!this.instantiationService.invokeFunction(assumeWorkbench)) {
			return TPromise.as(null);
		}
		return this.packageRegistryService.installAll().then(() => {
			this.notificationService.info('All dependencies successfully installed.');
		}, (e) => {
			this.notificationService.error(e);
			throw e;
		});
	}
}