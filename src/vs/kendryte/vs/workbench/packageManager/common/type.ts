import { IViewlet } from 'vs/workbench/common/viewlet';
import { Extensions as ViewContainerExtensions, IViewContainersRegistry, ViewContainer } from 'vs/workbench/common/views';
import { Registry } from 'vs/platform/registry/common/platform';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { localize } from 'vs/nls';
import { IPager } from 'vs/base/common/paging';

export const PACKAGE_MANAGER_VIEWLET_ID = 'workbench.view.package-manager';
export const PACKAGE_MANAGER_TITLE = localize('packageManager', 'Package Manager');

export const PACKAGE_MANAGER_VIEW_ID_LIBRARY = 'packageManager.library';
export const PACKAGE_MANAGER_VIEW_ID_EXAMPLE = 'packageManager.example';
export const PACKAGE_MANAGER_VIEW_CONTAINER: ViewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry)
	.registerViewContainer(PACKAGE_MANAGER_VIEWLET_ID);

export const PACKAGE_MANAGER_ACTION_ID_OPEN_MARKET = 'workbench.package-manager.action.open-market';

export interface IPackageManagerViewlet extends IViewlet {
}

export enum PackageTypes {
	Library = 'library',
	Example = 'example',
}

export interface IPackage {
	id: string;
	name: string;
	type: PackageTypes;
	version: string;
	url: string;
	iconUrl?: string;
}

export interface IPackageRegistryService {
	_serviceBrand: any;

	listLocal(query?: string): TPromise<IPackage[]>;
	openBrowser(sideByside?: boolean): TPromise<any>;
	queryPackageVersions(type: PackageTypes, packageName: string): TPromise<IRemotePackageInfo>;
	queryPackages(type: PackageTypes, search: string, page: number): TPromise<IPager<IRemotePackageInfo>>;
}

export const IPackageRegistryService = createDecorator<IPackageRegistryService>('packageRegistryService');
