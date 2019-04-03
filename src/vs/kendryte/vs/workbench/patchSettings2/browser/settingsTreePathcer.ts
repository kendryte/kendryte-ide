import * as st from 'vs/workbench/contrib/preferences/browser/settingsTree';
import {
	SettingsTreeGroupChild,
	SettingsTreeGroupElement,
	SettingsTreeNewExtensionsElement,
	SettingsTreeSettingElement,
} from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { IDisposable } from 'vs/base/common/lifecycle';
import { FieldInject } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { ITree } from 'vs/base/parts/tree/browser/tree';

const OriginalClass = st.SettingsTreeDelegate;

interface IDisposableTemplate {
	toDispose: IDisposable[];
}

class SettingsTreeDelegatePatch extends OriginalClass {
	protected injectors: FieldInject<any, any>[];

	getTemplateId(element: SettingsTreeGroupElement | SettingsTreeSettingElement | SettingsTreeNewExtensionsElement): string {
		for (const item of this.injectors) {
			const id = item.detect(element);
			if (id) {
				return id;
			}
		}
		return super.getTemplateId(element);
	}

	renderTemplate(tree: ITree, templateId: string, parent: HTMLElement): any {
		for (const item of this.injectors) {
			const template = item.template(tree, templateId, parent);
			if (template) {
				return template;
			}
		}
		// return super.renderTemplate(tree, templateId, parent);
	}

	renderElement(tree: ITree, element: SettingsTreeSettingElement, templateId: string, template: any): void {
		for (const item of this.injectors) {
			const hit = item.entry(tree, element, templateId, template);
			if (hit) {
				return;
			}
		}
		// super.renderElement(tree, element, templateId, template);
	}

	disposeTemplate(tree: ITree, templateId: string, template: IDisposableTemplate): void {
		for (const item of this.injectors) {
			const hit = item.dispose(tree, templateId, template);
			if (hit) {
				return;
			}
		}
		// return super.disposeTemplate(tree, templateId, template);
	}

	getHeight(element: SettingsTreeGroupChild): number {
		return super.getHeight(element);
	}
}

Object['assign'](st, {
	SettingsTreeDelegate: SettingsTreeDelegatePatch,
});
