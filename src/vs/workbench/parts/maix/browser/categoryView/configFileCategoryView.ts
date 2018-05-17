import { $ } from 'vs/base/browser/dom';
import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { ISelectionEvent } from 'vs/base/parts/tree/browser/tree';
import 'vs/css!./media/category';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchTree } from 'vs/platform/list/browser/listService';
import { Registry } from 'vs/platform/registry/common/platform';
import { ICanRender } from 'vs/workbench/parts/maix/browser/frame/mySplitView';
import { ConfigFileCategoryRender } from 'vs/workbench/parts/maix/browser/categoryView/configFileCategoryRender';
import { ConfigFileCategorySource } from 'vs/workbench/parts/maix/browser/categoryView/configFileCategorySource';
import { Extensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/common/category';

export class ConfigFileCategoryView extends Disposable implements IView, ICanRender {
	element: HTMLElement;
	minimumSize = 150;
	maximumSize = Infinity;
	onDidChange = Event.None;
	private readonly $category: WorkbenchTree;

	private lastId: string = '';

	private readonly _onChangeCategory = this._register(new Emitter<string[] | ISpecialSetting>());
	public readonly onChangeCategory = this._onChangeCategory.event;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
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
		console.log('ConfigFileCategoryView::renderEntries');
	}

	private onDidChangeSelection({ selection }: ISelectionEvent) {
		const sel: ISettingsCategoryTree = selection[0];
		if (!sel) {
			if (this.lastId !== '') {
				this._onChangeCategory.fire([]);
				this.lastId = '';
			}
			return;
		}

		if (this.lastId !== sel.id) {
			if (sel.special) {
				this._onChangeCategory.fire(sel.special);
			} else {
				this._onChangeCategory.fire(sel.settings);
			}
			this.lastId = sel.id;
		}
	}
}