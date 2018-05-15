/**
 * Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory)
 *     .registerCategory('some-category-id', '组名称', 'some-parent-category-id')
 *     .addSettings('some-category-id', 'some.setting.id', 'other.setting.id', 'other.setting.id')
 */

import { Extensions as CnfExt, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';

export enum Extensions {
	ConfigCategory = 'maix.category'
}

export interface IConfigCategoryRegistry {
	registerCategory(id: string, title: string, parentId?: string): this;

	addSettings(categoryId: string, ...settingIds: string[]): this;

	getRoot(): ISettingsCategoryTree;
}

const ConfigRegistry = Registry.as<IConfigurationRegistry>(CnfExt.Configuration);

Registry.add(Extensions.ConfigCategory, new class implements IConfigCategoryRegistry {
	private map: { [id: string]: ISettingsCategoryTree } = {};
	private root: ISettingsCategoryTree = {
		id: 'categoryRoot',
		category: 'ROOT',
		children: []
	};

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
		Object.freeze(newItem);
		return this;
	}

	addSettings(categoryId: string, ...settingIds: string[]) {
		const keys = ConfigRegistry.getConfigurationProperties();
		for (const id of settingIds) {
			if (keys.hasOwnProperty(id)) {
				throw new TypeError(`missing configuration entry: id=${id}`);
			}
		}

		const category = this.map[categoryId];
		if (!category) {
			throw new TypeError(`missing configuration group (as container): id=${categoryId}`);
		}

		category.settings.push(...settingIds);
		return this;
	}

	getRoot(): ISettingsCategoryTree {
		return this.root;
	}
});
