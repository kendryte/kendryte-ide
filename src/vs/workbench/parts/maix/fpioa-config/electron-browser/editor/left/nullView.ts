import { IListFuncMapEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/left/ids';
import { IRenderer } from 'vs/base/browser/ui/list/list';

export class NullRenderer implements IRenderer<IListFuncMapEntry, any> {
	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP_HIDE;
	}

	renderTemplate(parent: HTMLElement): void {
		parent.style.display = 'none';
	}

	renderElement(entry: IListFuncMapEntry, index: number, template: void): void {
	}

	disposeTemplate(template: void): void {
	}
}
