import { $ } from 'vs/base/browser/dom';
import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { ISelectionEvent } from 'vs/base/parts/tree/browser/tree';
import 'vs/css!../media/category';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchTree } from 'vs/platform/list/browser/listService';
import { Registry } from 'vs/platform/registry/common/platform';
import { ICanRender } from 'vs/workbench/parts/maix/settings-page/browser/frame/mySplitView';
import { ConfigFileCategoryRender } from 'vs/workbench/parts/maix/settings-page/browser/categoryView/configFileCategoryRender';
import { ConfigFileCategorySource } from 'vs/workbench/parts/maix/settings-page/browser/categoryView/configFileCategorySource';
import { deepSearch, Extensions, IConfigCategoryRegistry, treeParents } from 'vs/workbench/parts/maix/settings-page/common/category';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/settings-page/common/preferencesModels';
import { ILogService } from 'vs/platform/log/common/log';

export class ConfigFileCategoryView extends Disposable implements IView, ICanRender {
	element: HTMLElement;
	minimumSize = 150;
	maximumSize = Infinity;
	onDidChange = Event.None;
	private readonly $category: WorkbenchTree;

	private lastId: string = '';

	private readonly _onChangeCategory = this._register(new Emitter<INormalSetting | ISpecialSetting>());
	public readonly onChangeCategory = this._onChangeCategory.event;
	private _selecting: boolean;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ILogService private log: ILogService,
	) {
		super();

		const $left = this.element = $('div', { class: 'category' });
		$left.style.height = '100%';

		const renderer = instantiationService.createInstance(ConfigFileCategoryRender);

		this.$category = this._register(
			instantiationService.createInstance(WorkbenchTree, $left, {
				dataSource: new ConfigFileCategorySource,
				renderer
			}, {
					verticalScrollMode: ScrollbarVisibility.Visible,
					horizontalScrollMode: ScrollbarVisibility.Hidden
				})
		);

		this._register(this.$category.onDidChangeSelection(e => this.onDidChangeSelection(e)));

		const tree = Registry.as<IConfigCategoryRegistry>(Extensions.ConfigCategory).getRoot();
		this.$category.setInput(tree);
	}

	layout(width: number) {
		this.$category.layout(undefined, width);
	}

	public renderEntries() {
		this.log.debug('ConfigFileCategoryView::renderEntries');
	}

	private onDidChangeSelection({ selection }: ISelectionEvent) {
		const sel: ISettingsCategoryTree = selection[0];
		if (!sel) {
			if (this.lastId !== '') {
				this._onChangeCategory.fire({ categoryId: undefined, settings: [], type: 0 });
				this.lastId = '';
			}
			return;
		}

		if (this.lastId !== sel.id) {
			this.fire(sel);
		}
	}

	private fire(sel: ISettingsCategoryTree) {
		if (sel.special) {
			this._onChangeCategory.fire({ categoryId: sel.id, special: sel.special, type: 1 });
		} else {
			this._onChangeCategory.fire({ categoryId: sel.id, settings: sel.settings, type: 0 });
		}
		this.lastId = sel.id;
	}

	async updateModel(model: MySettingsEditorModelWrapper) {
		if (this._selecting) {
			return;
		}
		const id = model.getRememberedCategory();
		if (this.lastId && this.lastId === id) {
			return;
		} else if (!id) {
			return;
		}
		const select = deepSearch(this.$category.getInput(), id);
		if (select) {
			this._selecting = true;
			try {
				await this.$category.expandAll(treeParents(select));
			} catch (e) {
				this.log.error(e);
			}
			this.log.debug('-selection: %O', select);
			this.$category.setSelection([select], { source: 'api' });
			this.fire(select);
			this.log.debug('-selection OK');
			this._selecting = false;
		}
	}
}