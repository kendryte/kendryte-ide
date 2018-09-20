import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';

export interface EnumProviderService {
	// get enum selection list
	getValues(): TPromise<string[]> | string[];

	onChange(cb: (list: string[]) => void): IDisposable;
}

export interface EnumProviderConfig {
	__dyn_enum: boolean;

	service: ServiceIdentifier<EnumProviderService> | string;
	editable: boolean;

	toString(): string;
}

export function isDynamicEnum(setting: ISetting): boolean {
	return setting && setting.enumDescriptions && '__dyn_enum' in setting.enumDescriptions;
}

export function getDynamicEnum(setting: ISetting): EnumProviderConfig {
	if (isDynamicEnum(setting)) {
		return setting.enumDescriptions as any as EnumProviderConfig;
	} else {
		return null;
	}
}

export function dynamicEnum(service: ServiceIdentifier<EnumProviderService>, editable: boolean): EnumProviderConfig {
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

export const INodePathService = createDecorator<INodePathService>('INodePathService');

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

export const ACTION_ID_CREATE_SHORTCUTS = 'workbench.action.kendryte.createShortcuts';

export const ACTION_ID_MAIX_CMAKE_RUN = 'workbench.action.kendryte.run';
export const ACTION_ID_MAIX_CMAKE_BUILD = 'workbench.action.kendryte.build';
export const ACTION_ID_MAIX_CMAKE_CLEANUP = 'workbench.action.kendryte.cleanup';
export const ACTION_ID_MAIX_CMAKE_SELECT_TARGET = 'workbench.action.kendryte.select-target';
export const ACTION_ID_MAIX_CMAKE_SELECT_VARIANT = 'workbench.action.kendryte.select-variant';
export const ACTION_ID_MAIX_CMAKE_CONFIGURE = 'workbench.action.kendryte.configure';
export const ACTION_ID_MAIX_CMAKE_HELLO_WORLD = 'workbench.action.kendryte.hello-world';

export const ACTION_ID_MAIX_SERIAL_UPLOAD = 'workbench.action.kendryte.upload';
