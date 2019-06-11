import { $, append } from 'vs/base/browser/dom';
import { IListSplitElement, TEMPLATE_ID } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/left/ids';
import { ITreeNode, ITreeRenderer } from 'vs/base/browser/ui/tree/tree';
import { Event } from 'vs/base/common/event';

export class SplitRenderer implements ITreeRenderer<IListSplitElement, void, any> {
	onDidChangeTwistieState?: Event<IListSplitElement> | undefined;

	get templateId(): string {
		return TEMPLATE_ID.SPLIT;
	}

	renderTemplate(parent: HTMLElement): HTMLDivElement {
		return append(parent, $('hr.split'));
	}

	renderElement(element: ITreeNode<IListSplitElement>, index: number, templateData: void, dynamicHeightProbing?: boolean | undefined): void {
	}

	disposeTemplate(templateData: void): void {
	}
}
