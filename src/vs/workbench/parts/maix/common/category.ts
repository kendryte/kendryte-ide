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
	registerCategory(id: string, title: string, parentId?: string): this;

	addSettings(categoryId: string, ...settingIds: string[]): this;

	getRoot(): ISettingsCategoryTree;
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

	registerCategory(id: string, title: string, parentId?: string) {
		if (this.map.hasOwnProperty(id)) {
			throw new TypeError(`duplicated configuration group: id=${id}, title=${title}`);
		}

		const newItem: ISettingsCategoryTree = this.map[id] = {
			id,
			category: title,
			settings: [],
			children: [],
		};

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

	addSettings(categoryId: string, ...settingIds: string[]) {
		const category = this.map[categoryId];
		if (category) {
			category.settings.push(...settingIds);
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
			this.map[categoryId].settings.push(...settingIds);
		}
		this.toRegister.length = 0;
	}
});
