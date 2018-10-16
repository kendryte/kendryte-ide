import { FieldContext, FieldInject, FieldTemplate } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';
import { Button } from 'vs/base/browser/ui/button/button';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SettingsTreeSettingElement } from 'vs/workbench/parts/preferences/browser/settingsTreeModels';
import { ISettingItemTemplate } from 'vs/kendryte/vs/platform/extendSettings/common/type';

interface Template {
	button: Button;
}

export class ButtonInject extends FieldInject<string, Template> {
	ID = 'settings.button.template';

	private commandService: ICommandService;
	private themeService: IThemeService;

	protected dependency(): ServiceIdentifier<any>[] {
		return [ICommandService, IThemeService];
	}

	_template(tree: ITree, template: ISettingItemTemplate & FieldContext): Template {
		const button = new Button(template.controlElement);
		button.element.classList.add('settings-button');
		attachButtonStyler(button, this.themeService);

		template.toDispose.push(button.onDidClick(e => {
			if (!template.context) {
				return Promise.reject(new Error('system is not ready'));
			}
			return this.commandService.executeCommand(template.context.defaultValue);
		}));

		return {
			button,
		};
	}

	_entry(tree, element: SettingsTreeSettingElement, template: FieldTemplate<string, Template>): void {
		template.button.label = element.description;
	}

	_detect(element) {
		return element.setting.type === 'button';
	}
}