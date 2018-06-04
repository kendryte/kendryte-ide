import { $, addClass, addDisposableListener, append } from 'vs/base/browser/dom';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IListGroupEntry, TEMPLATE_ID } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/left/ids';
import { Emitter, Event } from 'vs/base/common/event';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';

export interface IGroupTitleEntry {
	parent: HTMLElement;
	$id: HTMLSpanElement;
	$name: HTMLSpanElement;
	clickEvent: IDisposable;
	currentId?: string;
}

export class GroupTitleRenderer implements IRenderer<IListGroupEntry, any> {
	private readonly _onClick = new Emitter<string>();
	readonly onClick: Event<string> = this._onClick.event;

	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP_GROUP;
	}

	renderTemplate(parent: HTMLElement): IGroupTitleEntry {
		addClass(parent, 'group-title');
		const $name = append(parent, $('span.name')) as HTMLSpanElement;
		const $id = append(parent, $('span.id')) as HTMLSpanElement;
		const ret: IGroupTitleEntry = {
			parent,
			$name,
			$id,
			clickEvent: addDisposableListener(parent, 'dblclick', () => {
				if (ret.currentId) {
					this._onClick.fire(ret.currentId);
				}
			}),
		};

		return ret;
	}

	renderElement(entry: IListGroupEntry, index: number, template: IGroupTitleEntry): void {
		template.$name.innerText = entry.description;
		template.$id.innerText = entry.id;
		template.currentId = entry.id;
	}

	disposeTemplate(template: IGroupTitleEntry): void {
		template.parent.innerText = '';
		dispose([template.clickEvent]);
		delete template.clickEvent;
	}
}
