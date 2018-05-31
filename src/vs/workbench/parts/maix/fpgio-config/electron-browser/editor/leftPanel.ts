import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpgio-config/browser/fpgioModel';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses } from 'vs/base/browser/dom';
import { IDelegate } from 'vs/base/browser/ui/list/list';
import { IFpgioLeftListEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpgio-config/browser/editor/left/ids';
import { SplitRenderer } from 'vs/workbench/parts/maix/fpgio-config/browser/editor/left/splitView';
import { ChipSelectRenderer } from 'vs/workbench/parts/maix/fpgio-config/browser/editor/left/chipSelectView';
import { FuncMapListItemRender } from 'vs/workbench/parts/maix/fpgio-config/browser/editor/left/funcMapListItemView';

export class FpgioLeftPanel extends Disposable implements IView {
	onDidChange = Event.None;
	element: HTMLElement;
	minimumSize: number = 280;
	maximumSize: number = Infinity;

	private readonly _onChipChange = new Emitter<string>();
	readonly onChipChange: Event<string> = this._onChipChange.event;

	private list: WorkbenchList<IFpgioLeftListEntry>;

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		super();
		this.element = $('div');
		addClasses(this.element, 'leftPanel', 'full-height-panel');

		const chipSelectRender = instantiationService.createInstance(ChipSelectRenderer);
		const funcMapListItemRender = instantiationService.createInstance(FuncMapListItemRender);

		this._register(chipSelectRender.onDidChange((newChip) => {
			this._onChipChange.fire(newChip);
		}));

		this.list = this._register(instantiationService.createInstance(
			WorkbenchList,
			this.element,
			new LeftPanelItemDelegate(),
			[chipSelectRender, new SplitRenderer, funcMapListItemRender],
			{
				identityProvider: e => e.id,
				ariaLabel: localize('settingsListLabel', 'Settings'),
				focusOnMouseDown: false,
				selectOnMouseDown: false,
				keyboardSupport: false,
				mouseSupport: false
			}
		)) as WorkbenchList<IFpgioLeftListEntry>;

		this.setCurrentChip(undefined);

		this.list.splice(1, 1, [{ id: null, templateId: TEMPLATE_ID.SPLIT }]);

	}

	public layout(width: number): void {
		this.list.layout(this.element.clientHeight);
	}

	updateList(currentFuncMap: IFuncPinMap) {
		this.list.splice(2, this.list.length, [
			// TODO
		]);
	}

	destroyList() {
		this.list.splice(2, this.list.length, []);
	}

	setCurrentChip(chipName: string) {
		this.list.splice(0, 1, [{ id: null, templateId: TEMPLATE_ID.CHIP_SELECT, selected: chipName }]);
	}
}

class LeftPanelItemDelegate implements IDelegate<IFpgioLeftListEntry> {
	getHeight(entry: IFpgioLeftListEntry) {
		if (entry.templateId === TEMPLATE_ID.CHIP_SELECT) {
			return 55;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP) {
			return 75;
		} else if (entry.templateId === TEMPLATE_ID.SPLIT) {
			return 15;
		}
		return 0;
	}

	getTemplateId(element: IFpgioLeftListEntry) {
		return element.templateId;
	}
}
