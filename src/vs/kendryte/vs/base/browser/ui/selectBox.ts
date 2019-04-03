import { ISelectOptionItem } from 'vs/base/browser/ui/selectBox/selectBox';

export function selectBoxFindIndex(selections: ISelectOptionItem[], selected: string): number {
	return selections.findIndex((item) => {
		return item.text === selected;
	});
}

export function selectBoxNames(text: string): ISelectOptionItem {
	return { text };
}

export const selectBoxSplitter: ISelectOptionItem = {
	text: '--',
	isDisabled: true,
};
