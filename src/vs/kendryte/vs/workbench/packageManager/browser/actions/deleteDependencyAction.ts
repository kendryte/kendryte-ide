import { Action } from 'vs/base/common/actions';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { ACTION_ID_PACKAGE_MANAGER_DELETE_DEPENDENCY, ACTION_LABEL_PACKAGE_MANAGER_DELETE_DEPENDENCY } from 'vs/kendryte/vs/base/common/menu/packageManager';
import { INotificationService } from 'vs/platform/notification/common/notification';

export class DeleteDependencyAction extends Action {
	constructor(
		private readonly packageName: string,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(
			ACTION_ID_PACKAGE_MANAGER_DELETE_DEPENDENCY,
			ACTION_LABEL_PACKAGE_MANAGER_DELETE_DEPENDENCY,
		);
	}

	public run(event?: any): Promise<void> {
		return this.packageRegistryService.erasePackage(this.packageName).then(() => {
			this.notificationService.info('Package removed.');
		}, (e) => {
			this.notificationService.error(e);
		});
	}
}
