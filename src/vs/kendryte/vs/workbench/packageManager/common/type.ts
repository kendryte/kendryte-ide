import { IViewlet } from 'vs/workbench/common/viewlet';
import { Extensions as ViewContainerExtensions, IViewContainersRegistry, ViewContainer } from 'vs/workbench/common/views';
import { Registry } from 'vs/platform/registry/common/platform';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { localize } from 'vs/nls';
import { IPager } from 'vs/base/common/paging';
import { CMakeProjectTypes, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { Event } from 'vs/base/common/event';

export const PACKAGE_MANAGER_LOG_CHANNEL_ID = 'workbench.log-channel.package-manager';

export const PACKAGE_MANAGER_VIEWLET_ID = 'workbench.view.package-manager';
export const PACKAGE_MANAGER_TITLE = localize('packageManager', 'Package Manager');

export const PACKAGE_MANAGER_VIEW_ID_LOCAL_INSTALLED_LIST = 'packageManager.local-install-list';
export const PACKAGE_MANAGER_VIEW_ID_CONFIG_LIST = 'packageManager.config';
export const PACKAGE_MANAGER_VIEW_CONTAINER: ViewContainer = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry)
	.registerViewContainer(PACKAGE_MANAGER_VIEWLET_ID);

export const PACKAGE_MANAGER_ACTION_ID_OPEN_PACKAGE = 'workbench.action.kendryte.openurl.package';

export interface IPackageManagerViewlet extends IViewlet {
}

export interface IPackageRegistryService {
	_serviceBrand: any;
	onLocalPackageChange: Event<void>;

	listLocal(projectPath?:string): Promise<ILibraryProject[]>;
	openBrowser(): Promise<any>;
	queryPackageVersions(type: CMakeProjectTypes, packageName: string): Promise<IRemotePackageInfo | undefined>;
	queryPackages(type: CMakeProjectTypes, search: string, page: number): Promise<IPager<IRemotePackageInfo>>;
	installDependency(packageInfo: IRemotePackageInfo, selectedVersion?: string): Promise<void>;
	installExample(currentElement: IRemotePackageInfo, selectedVersion: string, targetPath: string): Promise<string>;
	installAll(): Promise<void>;
	installProject(dir?: string): Promise<void>;
	getPackageInfoLocal(packageType: CMakeProjectTypes, packageName: string): Promise<ILibraryProject | undefined>;
	getPackageInfoRegistry(packageType: CMakeProjectTypes, packageName: string): Promise<IRemotePackageInfo | undefined>;
	erasePackage(packageName: string): Promise<void>;
}

export const IPackageRegistryService = createDecorator<IPackageRegistryService>('packageRegistryService');
