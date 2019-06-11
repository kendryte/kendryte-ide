import { $, addClass, addDisposableListener, append } from 'vs/base/browser/dom';
import { IListGroupElement, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { Emitter, Event } from 'vs/base/common/event';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';

export interface IGroupTitleTemplate {
	parent: HTMLElement;
	$id: HTMLSpanElement;
	$name: HTMLSpanElement;
	clickEvent: IDisposable;
	currentId?: string;
}

export class GroupTitleRenderer implements ITreeRenderer<IListGroupElement, void, IGroupTitleTemplate> {
	private readonly _onClick = new Emitter<string>();
	readonly onClick: Event<string> = this._onClick.event;

	get templateId(): string {
		return TEMPLATE_ID.FUNC_MAP_GROUP;
	}

	renderTemplate(parent: HTMLElement): IGroupTitleTemplate {
		addClass(parent, 'group-title');
		const $name = append(parent, $('span.name')) as HTMLSpanElement;
		const $id = append(parent, $('span.id')) as HTMLSpanElement;
		const ret: IGroupTitleTemplate = {
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

	renderElement({ element }: ITreeNode<IListGroupElement>, index: number, template: IGroupTitleTemplate): void {
		template.$name.innerText = element.description;
		template.$id.innerText = element.id;
		template.currentId = element.id;
	}

	public disposeElement(element: ITreeNode<IListGroupElement>, index: number, templateData: any): void {
	}

	disposeTemplate(template: IGroupTitleTemplate): void {
		template.parent.innerText = '';
		dispose([template.clickEvent]);
		delete template.clickEvent;
	}
}
