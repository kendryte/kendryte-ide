import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { WorkbenchObjectTree } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { $, addClasses } from 'vs/base/browser/dom';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import {
	IFpioaLeftListEntry,
	IFpioaLeftListEntryElement,
	IListChipSelectEntry,
	IListFuncMapEntry,
	IListGroupEntry,
	TEMPLATE_ID,
} from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { SplitRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/splitView';
import { ChipSelectRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/chipSelectView';
import { FuncMapListItemRender } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/funcMapListItemView';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { IChipInterface, IChipInterfaceClass, IChipPackagingCalculated } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { GroupTitleRenderer } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/groupTitleView';
import { PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { SimpleIdProvider } from 'vs/kendryte/vs/base/common/simpleIdProvider';
import { IFPIOAFuncPinMap } from 'vs/kendryte/vs/base/common/jsonSchemas/deviceManagerSchema';
import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';
import { isDeviceInterfaceClass } from 'vs/kendryte/vs/workbench/fpioaConfig/common/builder';

export class FpioaLeftPanel extends Disposable implements IView {
	onDidChange = Event.None;
	element: HTMLElement;
	minimumSize: number = 280;
	maximumSize: number = Infinity;

	private readonly _onChipChange = new Emitter<string | undefined>();
	readonly onChipChange = this._onChipChange.event;

	private readonly _onSetPinFunc = new Emitter<PinFuncSetEvent>();
	readonly onSetPinFunc: Event<PinFuncSetEvent> = this._onSetPinFunc.event;

	private list: WorkbenchObjectTree<IListEntry>;
	private funcMapListItemRender: FuncMapListItemRender;

	private chipName: string;
	private currentFuncMap: IFPIOAFuncPinMap = {};

	private displayListFlatCache: IListFuncMapEntry[];
	private readonly displayList: IFpioaLeftListEntry[] = [
		{
			element: { id: '##' + TEMPLATE_ID.CHIP_SELECT, templateId: TEMPLATE_ID.CHIP_SELECT, selected: '' },
			collapsible: false,
		},
		{
			element: { id: '##' + TEMPLATE_ID.SPLIT, templateId: TEMPLATE_ID.SPLIT },
			collapsible: false,
		},
	];

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

		this.list = this._register(instantiationService.createInstance(
			WorkbenchObjectTree,
			this.element,
			new LeftPanelItemDelegate(),
			[
				chipSelectRender,
				this.funcMapListItemRender,
				new SplitRenderer,
				new GroupTitleRenderer(),
			],
			{
				identityProvider: SimpleIdProvider<IListEntry>(),
				ariaLabel: localize('settingsListLabel', 'Settings'),
				keyboardSupport: false,
				mouseSupport: false,
			},
		));

		this.setCurrentChip(undefined);

		this.list.setChildren(null, this.displayList);
	}

	public layout(width: number): void {
		// console.log(width, this.element, this.element.clientHeight);
		this.list.layout(this.element.clientHeight);
	}

	updateList(currentFuncMap: IFPIOAFuncPinMap, needRefresh: boolean) {
		// console.warn('list update event!');
		this.currentFuncMap = currentFuncMap;
		for (const item of this.displayListFlatCache) {
			if (currentFuncMap[item.element.id] !== item.element.currentPin) {
				item.element.currentPin = currentFuncMap[item.element.id];
				if (needRefresh) {
					this.list.rerender(item.element);
				}
			}
		}
	}

	setCurrentChip(chipName: string | undefined) {
		if (this.chipName === chipName) {
			return;
		}
		// console.warn('new chip selected:', chipName);
		if (chipName) {
			this.chipName = chipName;
		} else {
			delete this.chipName;
		}

		(this.displayList[0] as IListChipSelectEntry).element.selected = chipName || '';
		if (chipName) {
			const chip = getChipPackaging(chipName);
			if (chip) {
				this.changeList(chip);
			} else {
				this.funcMapListItemRender.notifyPinMapChange({});
				this.destroyList();
			}
		} else {
			this.funcMapListItemRender.notifyPinMapChange({});
			this.destroyList();
		}
	}

	private changeList(chip: IChipPackagingCalculated) {
		// console.warn('pin map is changing');
		this.displayList.length = 2;
		this.displayListFlatCache = [];

		const parser = (item: IChipInterface<any> | IChipInterfaceClass<any>, list: IFpioaLeftListEntry[]) => {
			const group: IListGroupEntry = {
				element: {
					id: item.id,
					templateId: TEMPLATE_ID.FUNC_MAP_GROUP,
					description: item.title,
				},
				children: [],
				collapsible: true,
				collapsed: true,
			};
			list.push(group);
			if (isDeviceInterfaceClass(item)) {
				for (const subItem of item.devices) {
					parser(subItem, group.children);
				}
			} else {
				for (const [funcId, description] of Object.entries(item.functions)) {
					let currentPin = this.getExistsFuncPin(funcId);
					const entry = <IListFuncMapEntry>{
						element: {
							templateId: TEMPLATE_ID.FUNC_MAP,
							currentPin,
							id: funcId,
							description,
						},
						collapsible: false,
					};
					group.children.push(entry);
					this.displayListFlatCache.push(entry);
				}
			}
		};

		for (const item of chip.interfaceList) {
			parser(item, this.displayList);
		}

		const map = chip.geometry.IOPinPlacement;
		const ioToPin: { [id: string]: string } = {};
		Object.keys(map).forEach((key) => {
			const value = '' + map[key];
			ioToPin[value] = key;
		});
		this.funcMapListItemRender.notifyPinMapChange(ioToPin);
		this.list.setChildren(null, this.displayList);
	}

	private destroyList() {
		this.funcMapListItemRender.notifyPinMapChange({});
		this.displayList.splice(2, this.displayList.length);
		this.list.rerender();
	}

	private getExistsFuncPin(funcName: string) {
		return this.currentFuncMap[funcName];
	}
}

class LeftPanelItemDelegate implements IListVirtualDelegate<IFpioaLeftListEntryElement> {
	getHeight(entry: IFpioaLeftListEntryElement) {
		if (entry.templateId === TEMPLATE_ID.CHIP_SELECT) {
			return 55;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP) {
			return 32;
		} else if (entry.templateId === TEMPLATE_ID.FUNC_MAP_GROUP) {
			return 24;
		} else if (entry.templateId === TEMPLATE_ID.SPLIT) {
			return 15;
		}
		return 0;
	}

	getTemplateId(element: IFpioaLeftListEntryElement) {
		return element.templateId;
	}
}
