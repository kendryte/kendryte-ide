import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses } from 'vs/base/browser/dom';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IFpioaLeftListEntry, IListFuncMapEntry, IListGroupEntry, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { SplitRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/splitView';
import { ChipSelectRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/chipSelectView';
import { FuncMapListItemRender } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/funcMapListItemView';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { IChipPackagingCalculated } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { GroupTitleRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/groupTitleView';
import { NullRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/nullView';
import { IFuncPinMap, PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';

export class FpioaLeftPanel extends Disposable implements IView {
	onDidChange = Event.None;
	element: HTMLElement;
	minimumSize: number = 280;
	maximumSize: number = Infinity;

	private readonly _onChipChange = new Emitter<string>();
	readonly onChipChange: Event<string> = this._onChipChange.event;

	private readonly _onSetPinFunc = new Emitter<PinFuncSetEvent>();
	readonly onSetPinFunc: Event<PinFuncSetEvent> = this._onSetPinFunc.event;

	private list: WorkbenchList<IFpioaLeftListEntry>;
	private chipIOList: (IListGroupEntry | IListFuncMapEntry)[] = [];
	private funcMapListItemRender: FuncMapListItemRender;

	private chipName: string;
	private currentFuncMap: IFuncPinMap = {};

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
			[chipSelectRender, this.funcMapListItemRender, new SplitRenderer, new NullRenderer, groupRender],
			{
				identityProvider: e => e.id,
				ariaLabel: localize('settingsListLabel', 'Settings'),
				focusOnMouseDown: false,
				selectOnMouseDown: false,
				keyboardSupport: false,
				mouseSupport: false,
			},
		)) as WorkbenchList<IFpioaLeftListEntry>;

		this.setCurrentChip(undefined);

		this.list.splice(0, 2, [
			{ id: null, templateId: TEMPLATE_ID.CHIP_SELECT, selected: undefined },
			{ id: null, templateId: TEMPLATE_ID.SPLIT },
		]);
	}

	public layout(width: number): void {
		// console.log(width, this.element, this.element.clientHeight);
		this.list.layout(this.element.clientHeight);
	}

	updateList(currentFuncMap: IFuncPinMap) {
		// console.warn('list update event!');
		this.currentFuncMap = currentFuncMap;
		this.chipIOList.forEach((item: IListFuncMapEntry, index) => {
			if (currentFuncMap[item.fullId] !== item.currentPin) {
				item.currentPin = currentFuncMap[item.fullId];
				this.list.splice(index + 2, 1, [item]);
			}
		});
	}

	setCurrentChip(chipName: string) {
		if (this.chipName === chipName) {
			return;
		}
		// console.warn('new chip selected:', chipName);
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
		// console.warn('pin map is changing');
		const newList: (IListGroupEntry | IListFuncMapEntry)[] = [];

		chip.usableFunctions.forEach(({ funcBaseId: funName, ios, description }) => {
			newList.push({ id: funName.toUpperCase(), templateId: TEMPLATE_ID.FUNC_MAP_GROUP, description });

			ios.forEach(({ funcId, funcNumber, description, funcIdFull }) => {
				let currentPin = this.getExistsFuncPin(funcIdFull);
				newList.push(<IListFuncMapEntry>{
					templateId: TEMPLATE_ID.FUNC_MAP_HIDE,
					currentPin,
					id: funcId.toUpperCase(),
					fullId: funcIdFull,
					description,
				});
			});
		});

		this.chipIOList = newList;
		this.funcMapListItemRender.notifyPinMapChange(chip.geometry.IOPinPlacement);
		this.list.splice(2, this.list.length, this.chipIOList);
	}

	private destroyList() {
		this.funcMapListItemRender.notifyPinMapChange({});
		this.list.splice(2, this.list.length);
	}

	private getExistsFuncPin(funcName: string) {
		return this.currentFuncMap[funcName];
	}

	private onTitleClick(funcId: string) { // show/hide items under this title
		const titleLocation = this.chipIOList.findIndex((item) => {
			return item.id === funcId && item.templateId === TEMPLATE_ID.FUNC_MAP_GROUP;
		});
		if (titleLocation === -1) {
			return;
		}

		let count = 1; // title it self
		for (let index = titleLocation + 1; index < this.chipIOList.length; index++) {
			const item = this.chipIOList[index];
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

		this.list.splice(titleLocation + 2, count, this.chipIOList.slice(titleLocation, titleLocation + count));
	}
}

class LeftPanelItemDelegate implements IListVirtualDelegate<IFpioaLeftListEntry> {
	getHeight(entry: IFpioaLeftListEntry) {
		if (entry.templateId === TEMPLATE_ID.CHIP_SELECT) {
			return 55;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP) {
			return 66;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP_GROUP) {
			return 24;
		} else if (entry.templateId === TEMPLATE_ID.SPLIT) {
			return 15;
		}
		return 0;
	}

	getTemplateId(element: IFpioaLeftListEntry) {
		return element.templateId;
	}
}
