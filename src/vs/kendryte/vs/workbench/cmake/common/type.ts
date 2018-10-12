import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import { IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';

export const CMAKE_CHANNEL = 'maix-make-run';

export interface CurrentItem extends IQuickPickItem {
	current?: boolean;
}

export interface ICMakeService {
	_serviceBrand: any;

	onFolderChange(force?: boolean): TPromise<string>;

	cleanupMake(): TPromise<void>;

	getOutputFile(): TPromise<string>;

	configure(): TPromise<void>;

	build(): TPromise<void>;

	setVariant(variant: string);

	setTarget(target: string);

	getTargetList(): TPromise<CurrentItem[]>;

	getVariantList(): TPromise<CurrentItem[]>;

	ensureConfiguration(): TPromise<any>;
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
