import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';
import { IDisposable } from 'vs/base/common/lifecycle';

export enum TEMPLATE_ID {
	CHIP_SELECT = 'template.left.chip.select',
	SPLIT = 'template.left.split',
	FUNC_MAP = 'template.left.map.func',
	FUNC_MAP_HIDE = 'template.left.map.func_hide',
	FUNC_MAP_GROUP = 'template.left.map.group',
}

export interface IListSplitEntry extends IListEntry {
	templateId: TEMPLATE_ID;
}

export interface IListEmptyEntry extends IListSplitEntry {
}

export interface IListGroupEntry extends IListSplitEntry {
	description: string;
}

export interface IListFuncMapEntry extends IListSplitEntry {
	selectEvent: IDisposable;
	currentPin: string; // A3 B7 ...
	templateId: TEMPLATE_ID.FUNC_MAP|TEMPLATE_ID.FUNC_MAP_HIDE;
	description: string;
	fullId: string;
}

export interface IListChipSelectEntry extends IListSplitEntry {
	templateId: TEMPLATE_ID.CHIP_SELECT;
	selected: string;
}

export type IFpioaLeftListEntry = IListSplitEntry|IListFuncMapEntry|IListChipSelectEntry;
