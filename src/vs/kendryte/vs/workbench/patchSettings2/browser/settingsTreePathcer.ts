import * as st from 'vs/workbench/contrib/preferences/browser/settingsTree';
import { SETTINGS_COMPLEX_TEMPLATE_ID } from 'vs/workbench/contrib/preferences/browser/settingsTree';
import { SettingsTreeGroupChild } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { getSettingsExtendTypes, SettingsElementTypes } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';

const OriginalSettingsTreeDelegate = st.SettingsTreeDelegate;
const OriginalSettingTreeRenderers = st.SettingTreeRenderers;

class SettingTreeRenderersPatch extends OriginalSettingTreeRenderers {
	constructor(
		@IInstantiationService _instantiationService: IInstantiationService,
		@IContextMenuService _contextMenuService: IContextMenuService,
		@IContextViewService _contextViewService: IContextViewService,
	) {
		super(_instantiationService, _contextMenuService, _contextViewService);
		for (const item of getSettingsExtendTypes().values()) {
			this.allRenderers.push(item.renderer(_instantiationService, this.settingActions));
		}
	}
}

class SettingsTreeDelegatePatch extends OriginalSettingsTreeDelegate {
	constructor() {
		super();
		debugger;
	}

	getTemplateId(element: SettingsElementTypes): string {
		const id = super.getTemplateId(element);

		if (id === SETTINGS_COMPLEX_TEMPLATE_ID) {
			const newId = this.getExtendedTemplate(element);
			if (newId) {
				return newId;
			}
		}

		return id;
	}

	getHeight(element: SettingsTreeGroupChild): number {
		return super.getHeight(element);
	}

	hasDynamicHeight(element: SettingsElementTypes): boolean {
		return super.hasDynamicHeight(element);
	}

	setDynamicHeight(element: SettingsTreeGroupChild, height: number): void {
		return super.setDynamicHeight(element, height);
	}

	private getExtendedTemplate(element: SettingsElementTypes): string | void {
		debugger;
		for (const item of getSettingsExtendTypes().values()) {
			if (item.is(element)) {
				return item.templateId;
			}
		}
	}
}

Object['assign'](st, {
	SettingsTreeDelegate: SettingsTreeDelegatePatch,
	SettingTreeRenderers: SettingTreeRenderersPatch,
});
