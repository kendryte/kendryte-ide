import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { Event } from 'vs/base/common/event';
import { localize } from 'vs/nls';
import { ERROR_REQUIRE_FOLDER } from 'vs/base/common/messages';
import { CMakeError } from 'vs/kendryte/vs/workbench/cmake/common/errors';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const CMAKE_CHANNEL = 'maix-make-run';
export const CMAKE_CHANNEL_TITLE = 'Build/Run';

export const CMAKE_ERROR_MARKER = 'cmake/error';

export const CMAKE_ERROR_REQUIRE_FOLDER = ERROR_REQUIRE_FOLDER;
export const CMAKE_ERROR_NOT_PROJECT = localize('ErrorNotProject', 'This is not a cmake project.');

export enum CMakeStatus {
	BUSY = 'busy',
	PROJECT_ERROR = 'project,error',
	CONFIGURE_ERROR = 'configure,error',
	IDLE = 'idle',
	MAKE_ERROR = 'make,error',
}

export const CONTEXT_CMAKE_STATUS = new RawContextKey<CMakeStatus>('cmakeProjectStatus', CMakeStatus.BUSY);

export interface ICMakeSelection {
	variant: string;
	target: string;
}

export interface CurrentItem extends IQuickPickItem {
	current?: boolean;
}

export type IProjectList = ReadonlyMap<string/* project name */, string/* absolute path of CONTAIN DIR */>;

export interface ICMakeStatus {
	status: CMakeStatus;
	error?: CMakeError | Error;
}

export interface ICMakeService {
	_serviceBrand: any;

	readonly onCMakeStatusChange: Event<ICMakeStatus>;
	readonly onCMakeSelectionChange: Event<ICMakeSelection>;

	rescanCurrentFolder(): Promise<void>;
	cleanupMake(): Promise<void>;
	getOutputFile(): Promise<string>;
	configure(): Promise<void>;
	build(): Promise<void>;
	ensureConfiguration(): Promise<any>;
	shutdown(force?: boolean): Promise<void>;

	setVariant(variant: string): void;
	setTarget(target: string): void;

	getTargetList(): Promise<CurrentItem[]>;
	getVariantList(): Promise<CurrentItem[]>;
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
