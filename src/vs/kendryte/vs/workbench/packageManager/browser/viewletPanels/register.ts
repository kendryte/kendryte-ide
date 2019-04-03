import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { localize } from 'vs/nls';
import {
	PACKAGE_MANAGER_VIEW_CONTAINER,
	PACKAGE_MANAGER_VIEW_ID_CONFIG_LIST,
	PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST,
} from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions, IViewDescriptor, IViewsRegistry } from 'vs/workbench/common/views';
import { LocalPackagesListView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/localPackagesListView';
import { PackageConfigView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/packageConfigView';

export class PackageManagerViewletViewsContribution implements IWorkbenchContribution {
	constructor() {
		const viewsRegistry = Registry.as<IViewsRegistry>(Extensions.ViewsRegistry);
		viewsRegistry.registerViews([
			this.createListViewDescriptor(),
			this.createTreeViewDescriptor(),
		], PACKAGE_MANAGER_VIEW_CONTAINER);
	}

	private createListViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST,
			name: localize('package list', 'Package List'),
			ctorDescriptor: { ctor: LocalPackagesListView },
			weight: 2,
			order: 1,
		};
	}

	private createTreeViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_CONFIG_LIST,
			name: localize('config', 'Config'),
			ctorDescriptor: { ctor: PackageConfigView },
			weight: 1,
		};
	}
}
