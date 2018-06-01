import { $, append } from 'vs/base/browser/dom';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListSplitEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/ids';

export class SplitRenderer implements IRenderer<IListSplitEntry, any> {
	get templateId(): string {
		return TEMPLATE_ID.SPLIT;
	}

	renderTemplate(parent: HTMLElement): HTMLDivElement {
		return append(parent, $('hr.split'));
	}

	renderElement(entry: IListSplitEntry, index: number, template: HTMLDivElement): void {
	}

	disposeTemplate(template: HTMLDivElement): void {
		template.innerHTML = '';
	}
}
