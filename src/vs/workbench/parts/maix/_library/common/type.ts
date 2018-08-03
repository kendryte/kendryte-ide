import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
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
	ConfigCategory = 'maix.category'
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
