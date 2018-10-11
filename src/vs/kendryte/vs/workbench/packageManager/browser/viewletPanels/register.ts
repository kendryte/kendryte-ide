import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { localize } from 'vs/nls';
import { PACKAGE_MANAGER_VIEW_CONTAINER, PACKAGE_MANAGER_VIEW_ID_EXAMPLE, PACKAGE_MANAGER_VIEW_ID_LIBRARY } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IViewDescriptor, ViewsRegistry } from 'vs/workbench/common/views';
import { PackagesListView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/packagesListView';

export class PackageManagerViewletViewsContribution implements IWorkbenchContribution {
	constructor() {
		ViewsRegistry.registerViews([
			this.createExampleViewDescriptor(),
			this.createLibraryViewDescriptor(),
		]);
	}

	private createLibraryViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_LIBRARY,
			name: localize('library', 'Library'),
			container: PACKAGE_MANAGER_VIEW_CONTAINER,
			ctor: PackagesListView,
			weight: 1,
		};
	}

	private createExampleViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_EXAMPLE,
			name: localize('example', 'Example'),
			container: PACKAGE_MANAGER_VIEW_CONTAINER,
			ctor: PackagesListView,
			weight: 1,
		};
	}
}
