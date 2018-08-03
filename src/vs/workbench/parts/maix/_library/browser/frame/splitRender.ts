import { $, addClass, append } from 'vs/base/browser/dom';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IListEntry } from 'vs/workbench/services/preferences/common/keybindingsEditorModel';

export interface ISplitEntry extends IListEntry {
	title: string;
}

interface ISplitTemplate {
	context?: ISplitEntry;
	parent: HTMLElement;
	labelElement: HTMLElement;
}

const SPLIT_TEMPLATE_ID = 'SplitRenderer';

class SplitRenderer implements IRenderer<ISplitEntry, ISplitTemplate> {
	private $root: HTMLDivElement;

	get templateId(): string {
		return SPLIT_TEMPLATE_ID;
	}

	renderTemplate(parent: HTMLElement): ISplitTemplate {
		this.$root = append(parent, $('.split'));
		addClass(this.$root, 'group-title');

		const labelElement = append(parent, $('span.settings-group-title-label'));

		return {
			parent: parent,
			labelElement,
		};
	}

	renderElement(entry: ISplitEntry, index: number, template: ISplitTemplate): void {
		template.context = entry;
		template.labelElement.textContent = entry.title;
	}

	public disposeElement(element: ISplitEntry, index: number, templateData: any): void {
		// noop?
	}

	disposeTemplate(template: ISplitTemplate): void {
	}
}

export function createSplitRenderInstance(
	instantiationService: IInstantiationService,
) {
	return instantiationService.createInstance(SplitRenderer) as any;
}

