import { ISetting } from 'vs/workbench/services/preferences/common/preferences';

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
