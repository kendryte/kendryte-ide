import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';

export enum TEMPLATE_ID {
	CHIP_SELECT = 'template.left.chip.select',
	SPLIT = 'template.left.split',
	FUNC_MAP = 'template.left.map.func',
}

export interface IListSplitEntry extends IListEntry {
	templateId: TEMPLATE_ID;
}

export interface IListFuncMapEntry extends IListSplitEntry {
	templateId: TEMPLATE_ID.FUNC_MAP;
	pin: string;
	currentSelectedFunc: string;
}

export interface IListChipSelectEntry extends IListSplitEntry {
	templateId: TEMPLATE_ID.CHIP_SELECT;
	selected: string;
}

export type IFpgioLeftListEntry = IListSplitEntry | IListFuncMapEntry | IListChipSelectEntry;
