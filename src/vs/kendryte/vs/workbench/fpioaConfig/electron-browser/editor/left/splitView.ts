import { $, append } from 'vs/base/browser/dom';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListSplitEntry, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';

export class SplitRenderer implements IRenderer<IListSplitEntry, any> {
	get templateId(): string {
		return TEMPLATE_ID.SPLIT;
	}

	renderTemplate(parent: HTMLElement): HTMLDivElement {
		return append(parent, $('hr.split'));
	}

	renderElement(entry: IListSplitEntry, index: number, template: HTMLDivElement): void {
	}

	public disposeElement(element: IListSplitEntry, index: number, templateData: any): void {
		// noop?
	}

	disposeTemplate(template: HTMLDivElement): void {
		template.innerHTML = '';
	}
}
