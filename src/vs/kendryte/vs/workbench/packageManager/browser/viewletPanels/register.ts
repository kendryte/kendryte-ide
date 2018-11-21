import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { localize } from 'vs/nls';
import {
	PACKAGE_MANAGER_VIEW_CONTAINER,
	PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST,
	PACKAGE_MANAGER_VIEW_ID_LOCAL_TREE,
} from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IViewDescriptor, ViewsRegistry } from 'vs/workbench/common/views';
import { LocalPackagesListView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/localPackagesListView';
import { LocalPackagesTreeView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/localPackagesTreeView';

export class PackageManagerViewletViewsContribution implements IWorkbenchContribution {
	constructor() {
		ViewsRegistry.registerViews([
			this.createListViewDescriptor(),
			this.createTreeViewDescriptor(),
		]);
	}

	private createListViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST,
			name: localize('package list', 'Package List'),
			container: PACKAGE_MANAGER_VIEW_CONTAINER,
			ctor: LocalPackagesListView,
			weight: 1,
		};
	}

	private createTreeViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_LOCAL_TREE,
			name: localize('dependency tree', 'Dependency Tree'),
			container: PACKAGE_MANAGER_VIEW_CONTAINER,
			ctor: LocalPackagesTreeView,
			weight: 1,
		};
	}
}
