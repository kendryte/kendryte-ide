import { FieldContext, FieldInject, FieldTemplate } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { createDecorator, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { EnumProviderService, getDynamicEnum, isDynamicEnum, ISettingItemTemplate } from 'vs/kendryte/vs/workbench/config/common/type';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { attachEditableSelectBoxStyler, EditableSelectBox } from 'vs/kendryte/vs/workbench/patchSettings2/browser/ui/editableSelect';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { SettingsTreeSettingElement } from 'vs/workbench/parts/preferences/browser/settingsTreeModels';

interface Template {
	input: EditableSelectBox;
}

export class DynamicEnumInject extends FieldInject<string, Template> {
	ID = 'settings.dynamic-enum.template';

	private contextViewService: IContextViewService;
	private themeService: IThemeService;

	protected dependency() {
		return [IContextViewService, IThemeService];
	}

	protected _template(tree: ITree, template: ISettingItemTemplate & FieldContext): Template {
		const input = new EditableSelectBox(template.controlElement, this.contextViewService);
		template.toDispose.push(input);
		template.toDispose.push(attachEditableSelectBoxStyler(input, this.themeService));

		template.toDispose.push(input.onDidChange(e => {
			this.fireChangeEvent(template, e);
		}));

		return {
			input,
		};
	}

	protected _entry(tree, element: SettingsTreeSettingElement, template: FieldTemplate<string, Template>): void {
		const enumDef = getDynamicEnum(element.setting);
		if (!enumDef) {
			throw new TypeError('impossible');
		}
		if (typeof enumDef.service === 'string') {
			enumDef.service = createDecorator(enumDef.service);
		}
		const IDecorator = enumDef.service;

		const service: EnumProviderService<string> = this.instantiationService.invokeFunction((accessor: ServicesAccessor) => {
			return accessor.get(IDecorator);
		}) as EnumProviderService<string>;

		template.input.value = element.value;
		template.input.registerEnum(service.getValues());
	}

	_detect(element) {
		return isDynamicEnum(element.setting);
	}
}