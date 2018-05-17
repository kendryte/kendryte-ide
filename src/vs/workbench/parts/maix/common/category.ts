/**
 * Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory)
 *     .registerCategory('some-category-id', '组名称', 'some-parent-category-id')
 *     .addSettings('some-category-id', 'some.setting.id', 'other.setting.id', 'other.setting.id')
 */

import { Registry } from 'vs/platform/registry/common/platform';

export enum Extensions {
	ConfigCategory = 'maix.category'
}

export interface IConfigCategoryRegistry {
	registerCategory(category: ICategoryConfig): this;

	addSetting(categoryId: string, ...settingIds: string[]): this;

	addSettings(categoryId: string, settingIds: string[]): this;

	getRoot(): ISettingsCategoryTree;
}

export interface ICategoryConfig {
	id: string;
	category: string;
	settings?: string[];
	special?: ISpecialSetting;
	parent?: string;
}

Registry.add(Extensions.ConfigCategory, new class implements IConfigCategoryRegistry {
	private map: { [id: string]: ISettingsCategoryTree } = {};
	private root: ISettingsCategoryTree = {
		id: 'categoryRoot',
		category: 'ROOT',
		children: []
	};
	private toRegister: [string, string[]][] = [];
	private _inited: boolean = false;

	registerCategory({ id, category, settings, special, parent: parentId }: ICategoryConfig) {
		if (this.map.hasOwnProperty(id)) {
			throw new TypeError(`duplicated configuration group: id=${id}, title=${category}`);
		}

		const newItem: ISettingsCategoryTree = this.map[id] = { id, category, children: [] };
		if (special) {
			newItem.special = special;
		} else if (settings) {
			newItem.settings = settings.slice();
		} else {
			newItem.settings = [];
		}

		if (parentId) {
			const parent = this.map[parentId];
			if (!parent) {
				throw new TypeError(`missing configuration group (as parent): id=${parentId}, child=${id}`);
			}
			if (!parent.children) {
				parent.children = [];
			}
			newItem.parent = parent;
			parent.children.push(newItem);
		} else {
			newItem.parent = this.root;
			this.root.children.push(newItem);
		}
		Object.freeze(this.map[id]);
		return this;
	}

	addSetting(categoryId: string, ...settingIds: string[]) {
		return this.addSettings(categoryId, settingIds);
	}

	addSettings(categoryId: string, settingIds: string[]) {
		const category = this.map[categoryId];
		if (category) {
			if (Array.isArray(category.settings)) {
				category.settings.push(...settingIds);
			} else {
				throw new TypeError(`can not add settings to special page "${categoryId}"`);
			}
		} else {
			this.toRegister.push([categoryId, settingIds]);
			if (this._inited) {
				this._inited = false;
			}
		}
		return this;
	}

	getRoot(): ISettingsCategoryTree {
		if (!this._inited) {
			this._inited = true;
			this.init();
		}
		return this.root;
	}

	private init() {
		for (const [categoryId, settingIds] of this.toRegister) {
			if (!this.map.hasOwnProperty(categoryId)) {
				throw new TypeError(`missing configuration group (as container): id=${categoryId}`);
			}
			(this.map[categoryId].settings as string[]).push(...settingIds);
		}
		this.toRegister.length = 0;
	}
});
