import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { Event } from 'vs/base/common/event';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';

export interface EnumProviderService<T> {
	// get enum selection list
	getValues(): TPromise<T[]> | T[];
	onChange: Event<T[]>;
}

export interface EnumProviderConfig<T> {
	__dyn_enum: boolean;

	service: ServiceIdentifier<EnumProviderService<T>> | string;
	editable: boolean;

	toString(): string;
}

export function isDynamicEnum(setting: ISetting): boolean {
	return setting && setting.enumDescriptions && '__dyn_enum' in setting.enumDescriptions;
}

export function getDynamicEnum<T>(setting: ISetting): EnumProviderConfig<T> {
	if (isDynamicEnum(setting)) {
		return setting.enumDescriptions as any as EnumProviderConfig<T>;
	} else {
		return null;
	}
}

export function dynamicEnum<T>(service: ServiceIdentifier<EnumProviderService<T>>, editable: boolean): EnumProviderConfig<T> {
	return Object['assign']([], {
		__dyn_enum: true,
		service,
		editable,
		toString() {
			return 'Error: this enum must be handle by patched settings page.';
		},
	});
}

export enum Extensions {
	ConfigCategory = 'kendryte.category'
}

interface ITOCEntry {
	id: string;
	label: string;

	children?: ITOCEntry[];
	settings?: (string | ISetting)[];
}

export interface IConfigCategoryRegistry {
	registerCategory(category: ICategoryConfig): this;
	addSetting(categoryId: string, ...settingIds: string[]): this;
	addSettings(categoryId: string, settingIds: string[]): this;
	getRoot(): ITOCEntry;
}

export interface ICategoryConfig {
	id: string;
	category: string;
	settings?: string[];
	parent?: string;
}

export interface IDisposableTemplate {
	toDispose: IDisposable[];
}

export interface ISettingItemTemplate<T = any> extends IDisposableTemplate {
	onChange?: (value: T) => void;

	containerElement: HTMLElement;
	categoryElement: HTMLElement;
	labelElement: HTMLElement;
	descriptionElement: HTMLElement;
	controlElement: HTMLElement;
	isConfiguredElement: HTMLElement;
	otherOverridesElement: HTMLElement;
}

export const MAIX_CONFIG_KEY_DEBUG = 'debugger.target';
export const MAIX_CONFIG_KEY_SERIAL_BAUDRATE = 'serialport.baudrate';

export const INodePathService = createDecorator<INodePathService>('nodePathService');
export const INodeFileSystemService = createDecorator<INodeFileSystemService>('nodeFileSystemService');

export interface INodePathService {
	_serviceBrand: any;

	getInstallPath(): string;
	getDataPath(): string;
	exeFile(filePath: string): string;
	getToolchainBinPath(): string;
	getToolchainPath(): string;
	getSDKPath(): string;
	getPackagesPath(project?: string): string;
	rawToolchainPath(): string;
	rawSDKPath(): string;
	workspaceFilePath(s?: string): string;
	createUserLink(existsFile: string, linkFile: string): TPromise<void>;
	ensureTempDir(name?: string): TPromise<string>;
	tempDir(name?: string): string;
	createAppLink(): TPromise<void>;
}

export interface INodeFileSystemService {
	_serviceBrand: any;

	readFileIfExists(file: string): TPromise<string>;
	readFileIfExists(file: string, raw: true): TPromise<Buffer>;
	writeFileIfChanged(file: string, data: string | Buffer): TPromise<boolean>;
	copyWithin(from: string, to: string): TPromise<void>;
	copyReplace(from: string, to: string): TPromise<void>;
}

export interface IUpdate {
	name: string;
	version: string;
	downloadUrl: string;
}

export type UpdateList = IUpdate[];
export type UpdateListFulfilled = (IUpdate & { downloaded: string })[];

export interface IIDEBuildingBlocksService {
	_serviceBrand: any;
	readonly onProgress: Event<string>;

	fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList>;
	realRunUpdate(data: UpdateListFulfilled): TPromise<void>;
}

export const IIDEBuildingBlocksService = createDecorator<IIDEBuildingBlocksService>('ideBuildingBlocksService');

export const ACTION_ID_CREATE_SHORTCUTS = 'workbench.action.kendryte.createShortcuts';

export const ACTION_ID_MAIX_CMAKE_RUN = 'workbench.action.kendryte.run';
export const ACTION_ID_MAIX_CMAKE_BUILD = 'workbench.action.kendryte.build';
export const ACTION_ID_MAIX_CMAKE_CLEANUP = 'workbench.action.kendryte.cleanup';
export const ACTION_ID_MAIX_CMAKE_SELECT_TARGET = 'workbench.action.kendryte.select-target';
export const ACTION_ID_MAIX_CMAKE_SELECT_VARIANT = 'workbench.action.kendryte.select-variant';
export const ACTION_ID_MAIX_CMAKE_CONFIGURE = 'workbench.action.kendryte.configure';
export const ACTION_ID_MAIX_CMAKE_HELLO_WORLD = 'workbench.action.kendryte.hello-world';

export const ACTION_ID_MAIX_SERIAL_UPLOAD = 'workbench.action.kendryte.upload';
