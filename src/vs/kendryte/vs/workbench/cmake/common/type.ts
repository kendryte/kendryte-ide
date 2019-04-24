import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { Event } from 'vs/base/common/event';
import { localize } from 'vs/nls';

export const CMAKE_CHANNEL = 'maix-make-run';
export const CMAKE_CHANNEL_TITLE = 'Build/Run';

export const CMAKE_ERROR_REQUIRE_FOLDER = localize('ErrorRequireFolder', 'You must open a folder to do this.');
export const CMAKE_ERROR_NOT_PROJECT = localize('ErrorNotProject', 'You must open a folder to do this.');

export interface ICMakeSelection {
	variant: string;
	target: string;
}

export interface CurrentItem extends IQuickPickItem {
	current?: boolean;
}

export interface IBeforeBuild {
	waitUntil(thenable: Promise<void>): void;
}

export interface ICMakeService {
	_serviceBrand: any;

	readonly onCMakeProjectChange: Event<Error | null>;
	readonly onCMakeSelectionChange: Event<ICMakeSelection>;
	readonly onPrepareBuild: Event<IBeforeBuild>;

	readonly isEnabled: boolean;
	rescanCurrentFolder(): Promise<void>;
	cleanupMake(): Promise<void>;
	getOutputFile(): Promise<string>;
	configure(): Promise<void>;
	build(): Promise<void>;
	setVariant(variant: string): void;
	setTarget(target: string): void;
	getTargetList(): Promise<CurrentItem[]>;
	getVariantList(): Promise<CurrentItem[]>;
	ensureConfiguration(): Promise<any>;
	shutdown(force?: boolean): Promise<void>;
}

export const ICMakeService = createDecorator<ICMakeService>('ICMakeService');

export interface IBuildPackageService {
	_serviceBrand: any;

	upgradeEverything(): Promise<void>;

	downloadOrUpdate(version: VersionMatrix): Promise<void>;
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
