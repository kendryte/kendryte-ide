import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/fpgioModel';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses } from 'vs/base/browser/dom';
import { IDelegate } from 'vs/base/browser/ui/list/list';
import { IFpgioLeftListEntry, IListFuncMapEntry, IListGroupEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/ids';
import { SplitRenderer } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/splitView';
import { ChipSelectRenderer } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/chipSelectView';
import { FuncMapListItemRender } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/funcMapListItemView';
import { EmptyRenderer } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/emptyView';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpgio-config/common/packagingRegistry';
import { IChipPackagingCalculated } from 'vs/workbench/parts/maix/fpgio-config/common/packagingTypes';
import { GroupTitleRenderer } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/groupTitleView';
import { NullRenderer } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/nullView';
import { PinFuncSetEvent } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/fpgioEditor';

export class FpgioLeftPanel extends Disposable implements IView {
	onDidChange = Event.None;
	element: HTMLElement;
	minimumSize: number = 280;
	maximumSize: number = Infinity;

	private readonly _onChipChange = new Emitter<string>();
	readonly onChipChange: Event<string> = this._onChipChange.event;

	private readonly _onSetPinFunc = new Emitter<PinFuncSetEvent>();
	readonly onSetPinFunc: Event<PinFuncSetEvent> = this._onSetPinFunc.event;

	private list: WorkbenchList<IFpgioLeftListEntry>;
	private chipIOList: (IListGroupEntry | IListFuncMapEntry)[] = [];
	private funcMapListItemRender: FuncMapListItemRender;

	private chipName: string;

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		super();
		this.element = $('div');
		addClasses(this.element, 'leftPanel', 'full-height-panel');

		const chipSelectRender = instantiationService.createInstance(ChipSelectRenderer);
		this._register(chipSelectRender.onDidChange((newChip) => {
			this._onChipChange.fire(newChip);
		}));

		this.funcMapListItemRender = this._register(instantiationService.createInstance(FuncMapListItemRender));
		this._register(this.funcMapListItemRender.onSetPin((map) => {
			this._onSetPinFunc.fire(map);
		}));

		const groupRender = new GroupTitleRenderer();
		this._register(groupRender.onClick((name) => {
			this.onTitleClick(name);
		}));

		this.list = this._register(instantiationService.createInstance(
			WorkbenchList,
			this.element,
			new LeftPanelItemDelegate(),
			[chipSelectRender, this.funcMapListItemRender, new SplitRenderer, new NullRenderer, new EmptyRenderer, groupRender],
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

		this.list.splice(0, 2, [
			{ id: null, templateId: TEMPLATE_ID.CHIP_SELECT, selected: undefined },
			{ id: null, templateId: TEMPLATE_ID.SPLIT }
		]);
	}

	public layout(width: number): void {
		this.list.layout(this.element.clientHeight);
	}

	updateList(currentFuncMap: IFuncPinMap) {

	}

	setCurrentChip(chipName: string) {
		if (this.chipName === chipName) {
			return;
		}
		this.chipName = chipName;

		this.list.splice(0, 1, [{ id: null, templateId: TEMPLATE_ID.CHIP_SELECT, selected: chipName }]);
		if (chipName) {
			this.changeList(getChipPackaging(chipName));
		} else {
			this.funcMapListItemRender.notifyPinMapChange({});
			this.destroyList();
		}
	}

	private changeList(chip: IChipPackagingCalculated) {
		const newList: (IListGroupEntry | IListFuncMapEntry)[] = [];

		chip.usableFunctions.forEach(({ name: funName, ios, description }) => {
			newList.push({ id: funName.toUpperCase(), templateId: TEMPLATE_ID.FUNC_MAP_GROUP, description });

			ios.forEach(({ name: pinName, funcNumber, description }) => {
				const funcFullName = funName.toUpperCase() + '_' + pinName.toUpperCase();
				newList.push(<IListFuncMapEntry>{
					templateId: TEMPLATE_ID.FUNC_MAP_HIDE,
					pin: this.getExistsFuncPin(funcFullName),
					id: pinName.toUpperCase(),
					full: funcFullName,
					description,
				});
			});
		});

		this.chipIOList = newList;
		this.funcMapListItemRender.notifyPinMapChange(chip.geometry.IOPinPlacement);
		this.list.splice(2, this.list.length, this.chipIOList);
	}

	destroyList() {
		this.funcMapListItemRender.notifyPinMapChange({});
		this.list.splice(2, this.list.length, [{ id: null, templateId: TEMPLATE_ID.CHIP_PLEASE_SELECT }]);
	}

	private getExistsFuncPin(funcName: string) {
		for (const item of this.chipIOList as IListFuncMapEntry[]) {
			if (item.id === funcName) {
				return item.pin;
			}
		}
		return undefined;
	}

	private onTitleClick(funcId: string) { // show/hide items under this title
		let state = false, start: number, count = 0;
		for (const item of this.chipIOList) {
			if (state) {
				if (item.templateId === TEMPLATE_ID.FUNC_MAP) { // to find next title
					item.templateId = TEMPLATE_ID.FUNC_MAP_HIDE;
					count++;
				} else if (item.templateId === TEMPLATE_ID.FUNC_MAP_HIDE) { // to find next title
					item.templateId = TEMPLATE_ID.FUNC_MAP;
					count++;
				} else {
					break;
				}
			}
			if (item.id === funcId) {
				start = this.chipIOList.indexOf(item) + 1;
				state = true;
			}
		}

		if (!state) {
			return; // ???
		}

		this.list.splice(start + 2, count, this.chipIOList.slice(start, start + count));
	}
}

class LeftPanelItemDelegate implements IDelegate<IFpgioLeftListEntry> {
	getHeight(entry: IFpgioLeftListEntry) {
		if (entry.templateId === TEMPLATE_ID.CHIP_SELECT) {
			return 55;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP) {
			return 66;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP_GROUP) {
			return 24;
		} else if (entry.templateId === TEMPLATE_ID.SPLIT) {
			return 15;
		} else if (entry.templateId === TEMPLATE_ID.CHIP_PLEASE_SELECT) {
			return 80;
		}
		return 0;
	}

	getTemplateId(element: IFpgioLeftListEntry) {
		return element.templateId;
	}
}
