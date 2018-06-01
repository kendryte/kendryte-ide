import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListFuncMapEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/left/ids';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';

export interface IFuncMapTemplate {
	parent: HTMLElement;
	input: SelectBox;
	toDispose: IDisposable;
}

export class FuncMapListItemRender implements IRenderer<IListFuncMapEntry, IFuncMapTemplate> {
	private readonly _onDidChange = new Emitter<string>();
	readonly onDidChange: Event<string> = this._onDidChange.event;

	constructor(
		@IContextViewService protected contextViewService: IContextViewService,
	) {
	}

	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP;
	}

	renderTemplate(parent: HTMLElement): IFuncMapTemplate {
		return {
			parent,
			input: null,
			toDispose: null,
		};
	}

	renderElement(entry: IListFuncMapEntry, index: number, template: IFuncMapTemplate): void {
		template.parent.innerHTML = `<pre>${JSON.stringify(entry, null, 2)}</pre>`;
	}

	disposeTemplate(template: IFuncMapTemplate): void {
		// dispose(template.input, template.toDispose);
	}
}
