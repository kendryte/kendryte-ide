import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import { IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';

export const CMAKE_CHANNEL = 'maix-make-run';

export interface CurrentItem extends IQuickPickItem {
	current?: boolean;
}

export interface ICMakeService {
	_serviceBrand: any;

	onFolderChange(force?: boolean): TPromise<void>;

	cleanupMake(): TPromise<void>;

	getOutputFile(): TPromise<string>;

	configure(): TPromise<void>;

	build(): TPromise<void>;

	setVariant(variant: string);

	setTarget(target: string);

	getTargetList(): TPromise<CurrentItem[]>;

	getVariantList(): TPromise<CurrentItem[]>;
}

export const ICMakeService = createDecorator<ICMakeService>('ICMakeService');

export interface IBuildPackageService {
	_serviceBrand: any;

	upgradeEverything(): TPromise<void>;

	downloadOrUpdate(version: VersionMatrix): TPromise<void>;
}

export interface ArchVersion {
	32: string;
	64: string;
}

export interface VersionMatrix {
	windows: ArchVersion;
	linux: ArchVersion;
	mac: ArchVersion;
}

export const IBuildPackageService = createDecorator<IBuildPackageService>('IBuildPackageService');

export const ACTION_ID_MAIX_CMAKE_RUN = 'workbench.action.maix.run';
export const ACTION_ID_MAIX_CMAKE_BUILD = 'workbench.action.maix.build';
export const ACTION_ID_MAIX_CMAKE_UPLOAD = 'workbench.action.maix.upload';
export const ACTION_ID_MAIX_CMAKE_CLEANUP = 'workbench.action.maix.cleanup';
export const ACTION_ID_MAIX_CMAKE_SELECT_TARGET = 'workbench.action.maix.select-target';
export const ACTION_ID_MAIX_CMAKE_SELECT_VARIANT = 'workbench.action.maix.select-variant';
export const ACTION_ID_MAIX_CMAKE_HELLO_WORLD = 'workbench.action.maix.hello-world';

export function CMakeInternalVariants(): CurrentItem[] {
	return [
		{
			id: 'Debug',
			label: 'Debug',
			description: 'Debug without optimizations',
		},
		{
			id: 'Release',
			label: 'Release',
			description: 'Enable optimizations, omit debug info',
		},
		{
			id: 'MinSizeRel',
			label: 'Minimal Release',
			description: 'Optimize for smallest binary size',
		},
		{
			id: 'RelWithDebInfo',
			label: 'Release with debugging',
			description: 'Perform optimizations AND include debugging information',
		},
	];
}

export interface IPackageVersionPlatform {
	32: string;
	64: string;
	generic: string;
}

export interface IPackageVersion {
	version: string;
	windows: IPackageVersionPlatform;
	linux: IPackageVersionPlatform;
	mac: IPackageVersionPlatform;
}