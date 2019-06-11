import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ITreeElement } from 'vs/base/browser/ui/tree/tree';

export enum TEMPLATE_ID {
	CHIP_SELECT = 'template.left.chip.select',
	SPLIT = 'template.left.split',
	FUNC_MAP = 'template.left.map.func',
	FUNC_MAP_GROUP = 'template.left.map.group',
}

export interface IListSplitElement extends IListEntry {
	templateId: TEMPLATE_ID;
}

export interface IListSplitEntry extends ITreeElement<any> {
	element: IListSplitElement
}

export interface IListEmptyEntry extends IListSplitEntry {
	children: undefined;
}

export interface IListGroupElement extends IListEntry {
	templateId: TEMPLATE_ID.FUNC_MAP_GROUP;
	description: string;
}

export interface IListGroupEntry extends IListSplitEntry {
	element: IListGroupElement;
	children: IListFuncMapEntry[];
}

export interface IListFuncMapElement extends IListEntry {
	selectEvent: IDisposable;
	currentPin: string; // A3 B7 ...
	templateId: TEMPLATE_ID.FUNC_MAP;
	description: string;
}

export interface IListFuncMapEntry extends IListSplitEntry {
	element: IListFuncMapElement;
	children: undefined;
}

export interface IListChipSelectElement extends IListEntry {
	templateId: TEMPLATE_ID.CHIP_SELECT;
	selected: string;
}

export interface IListChipSelectEntry extends IListSplitEntry {
	element: IListChipSelectElement;
	children: undefined;
}

export type IFpioaLeftListEntry = IListSplitEntry | IListGroupEntry | IListFuncMapEntry | IListChipSelectEntry;
export type IFpioaLeftListEntryElement = IListSplitElement | IListGroupElement | IListFuncMapElement | IListChipSelectElement;
