export enum Extensions {
	ConfigCategory = 'kendryte.category'
}

export interface IConfigCategoryRegistry {
	registerCategory(category: ICategoryConfig): this;
	addSetting(categoryId: string, ...settingIds: string[]): this;
	addSettings(categoryId: string, settingIds: string[]): this;
}

export interface ICategoryConfig {
	id: string;
	category: string;
	settings?: string[];
	parent?: string;
}
