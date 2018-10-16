import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { Event } from 'vs/base/common/event';

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
