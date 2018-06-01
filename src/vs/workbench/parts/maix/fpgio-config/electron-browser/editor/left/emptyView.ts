import { $, append } from 'vs/base/browser/dom';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListEmptyEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/ids';
import { localize } from 'vs/nls';

export class EmptyRenderer implements IRenderer<IListEmptyEntry, any> {
	get templateId(): string {
		return TEMPLATE_ID.CHIP_PLEASE_SELECT;
	}

	renderTemplate(parent: HTMLElement): HTMLElement {
		const $h = append(parent, $('h2.empty'));
		$h.innerText = localize('fpgio.must.select', 'You must select a chip.');
		return $h;
	}

	renderElement(entry: IListEmptyEntry, index: number, template: HTMLElement): void {
	}

	disposeTemplate(template: HTMLElement): void {
		template.innerHTML = '';
	}
}
