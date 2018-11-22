import { IViewlet } from 'vs/workbench/common/viewlet';
import { Extensions as ViewContainerExtensions, IViewContainersRegistry, ViewContainer } from 'vs/workbench/common/views';
import { Registry } from 'vs/platform/registry/common/platform';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { localize } from 'vs/nls';
import { IPager } from 'vs/base/common/paging';

export const PACKAGE_MANAGER_LOG_CHANNEL_ID = 'workbench.log-channel.package-manager';

export const PACKAGE_MANAGER_VIEWLET_ID = 'workbench.view.package-manager';
export const PACKAGE_MANAGER_TITLE = localize('packageManager', 'Package Manager');

export const PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST = 'packageManager.local-install-list';
export const PACKAGE_MANAGER_VIEW_ID_LOCAL_TREE = 'packageManager.local-tree';
export const PACKAGE_MANAGER_VIEW_CONTAINER: ViewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry)
	.registerViewContainer(PACKAGE_MANAGER_VIEWLET_ID);

export const PACKAGE_MANAGER_ACTION_ID_OPEN_MARKET = 'workbench.package-manager.action.open-market';
export const PACKAGE_MANAGER_ACTION_ID_OPEN_PACKAGE = 'workbench.action.kendryte.openurl.package';
export const PACKAGE_MANAGER_ACTION_ID_INSTALL_DEPENDENCY = 'workbench.package-manager.action.install-everything';

export interface IPackageManagerViewlet extends IViewlet {
}

export enum PackageTypes {
	Library = 'library',
	Example = 'example',
}

export interface IPackageRegistryService {
	_serviceBrand: any;

	listLocal(): TPromise<IRemotePackageInfo[]>;
	openBrowser(sideByside?: boolean): TPromise<any>;
	queryPackageVersions(type: PackageTypes, packageName: string): TPromise<IRemotePackageInfo>;
	queryPackages(type: PackageTypes, search: string, page: number): TPromise<IPager<IRemotePackageInfo>>;
	installDependency(packageInfo: IRemotePackageInfo, selectedVersion: string): TPromise<void>;
	installExample(currentElement: IRemotePackageInfo, selectedVersion: string, targetPath: string): TPromise<string>;
	installAll(): TPromise<void>;
}

export const IPackageRegistryService = createDecorator<IPackageRegistryService>('packageRegistryService');
