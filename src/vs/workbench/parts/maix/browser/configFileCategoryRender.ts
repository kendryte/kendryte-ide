import { $, addClass, append } from 'vs/base/browser/dom';
import { IRenderer, ITree } from 'vs/base/parts/tree/browser/tree';

export interface TemplateData {
	dom: HTMLDivElement;
}

export class ConfigFileCategoryRender implements IRenderer {
	private static readonly TEMPLATE_ID = 'folderMatch';
	private static readonly ITEM_HEIGHT = 22;

	public disposeTemplate(tree: ITree, templateId: string, templateData: TemplateData): void {
	}

	public getHeight(tree: ITree, element: ISettingsCategoryTree): number {
		return ConfigFileCategoryRender.ITEM_HEIGHT;
	}

	public getTemplateId(tree: ITree, element: ISettingsCategoryTree): string {
		return ConfigFileCategoryRender.TEMPLATE_ID;
	}

	public renderElement(tree: ITree, element: ISettingsCategoryTree, templateId: string, templateData: TemplateData): void {
		templateData.dom.innerText = element.category;
	}

	public renderTemplate(tree: ITree, templateId: string, container: HTMLElement): TemplateData {
		addClass(container, 'custom-view-tree-node-item');
		const dom: HTMLDivElement = $('div', { class: 'ConfigFileCategoryRender' });
		append(container, dom);

		return {
			dom
		};
	}

}