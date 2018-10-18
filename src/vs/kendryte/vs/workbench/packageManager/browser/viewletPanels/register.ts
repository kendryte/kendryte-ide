import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { localize } from 'vs/nls';
import { PACKAGE_MANAGER_VIEW_CONTAINER,  PACKAGE_MANAGER_VIEW_ID_LIBRARY } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IViewDescriptor, ViewsRegistry } from 'vs/workbench/common/views';
import { LocalPackagesListView } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/localPackagesListView';

export class PackageManagerViewletViewsContribution implements IWorkbenchContribution {
	constructor() {
		ViewsRegistry.registerViews([
			this.createLibraryViewDescriptor(),
		]);
	}

	private createLibraryViewDescriptor(): IViewDescriptor {
		return {
			id: PACKAGE_MANAGER_VIEW_ID_LIBRARY,
			name: localize('library', 'Library'),
			container: PACKAGE_MANAGER_VIEW_CONTAINER,
			ctor: LocalPackagesListView,
			weight: 1,
		};
	}
}
