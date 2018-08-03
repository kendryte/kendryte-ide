/**
 * Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory)
 *     .registerCategory('some-category-id', '组名称', 'some-parent-category-id')
 *     .addSettings('some-category-id', 'some.setting.id', 'other.setting.id', 'other.setting.id')
 */

import { Registry } from 'vs/platform/registry/common/platform';
import { ITOCEntry, tocData } from 'vs/workbench/parts/preferences/browser/settingsLayout';
import { Extensions, ICategoryConfig, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/_library/common/type';

/*(function modifyInternalTocData() {
	tocData.children = [
		{
			id: 'full',
			label: localize('advanceSettings', 'Full Settings'),
			children: tocData.children,
		},
	];
})();*/

Registry.add(Extensions.ConfigCategory, new class implements IConfigCategoryRegistry {
	private map: { [id: string]: ITOCEntry } = {};
	private root: ITOCEntry = tocData;
	private internalCategoryCount = tocData.children.length;
	private toRegister: [string, string[]][] = [];
	private _inited: boolean = false;

	registerCategory({ id, category, settings, parent: parentId }: ICategoryConfig) {
		if (this.map.hasOwnProperty(id)) {
			throw new TypeError(`duplicated configuration group: id=${id}, title=${category}`);
		}

		const newItem: ITOCEntry = this.map[id] = { id, label: category, children: [] };
		if (settings && settings.length) {
			newItem.settings = settings.slice();
		}

		if (parentId) {
			const parent = this.map[parentId];
			if (!parent) {
				throw new TypeError(`missing configuration group (as parent): id=${parentId}, child=${id}`);
			}
			if (!parent.children) {
				parent.children = [];
			}
			parent.children.push(newItem);
		} else {
			this.root.children.splice(this.root.children.length - this.internalCategoryCount, 0, newItem);
		}
		return this;
	}

	addSetting(categoryId: string, ...settingIds: string[]) {
		return this.addSettings(categoryId, settingIds);
	}

	addSettings(categoryId: string, settingIds: string[]) {
		const category = this.map[categoryId];
		if (category) {
			if (!category.settings) {
				category.settings = [];
			}
			category.settings.push(...settingIds);
		} else {
			this.toRegister.push([categoryId, settingIds]);
			if (this._inited) {
				this._inited = false;
			}
		}
		return this;
	}

	getRoot(): ITOCEntry {
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
