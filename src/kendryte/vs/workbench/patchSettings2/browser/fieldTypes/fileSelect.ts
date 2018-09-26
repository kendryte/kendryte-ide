import { FieldContext, FieldInject, FieldTemplate } from 'kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { attachButtonStyler, attachInputBoxStyler } from 'vs/platform/theme/common/styler';
import { Button } from 'vs/base/browser/ui/button/button';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { $, append } from 'vs/base/browser/dom';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import 'vs/css!kendryte/vs/workbench/patchSettings2/browser/ui/fileSelect';
import { ISettingItemTemplate } from 'kendryte/vs/platform/common/type';
import { SettingsTreeSettingElement } from 'vs/workbench/parts/preferences/browser/settingsTreeModels';

interface Template {
	$input: InputBox;
}

export class FileInject extends FieldInject<string, Template> {
	ID = 'settings.file.template';

	private contextViewService: IContextViewService;
	private themeService: IThemeService;
	private windowsService: IWindowsService;

	protected dependency(): ServiceIdentifier<any>[] {
		return [IContextViewService, IThemeService, IWindowsService];
	}

	_template(tree: ITree, template: ISettingItemTemplate & FieldContext): Template {
		const $parent = append(template.controlElement, $('div.fileSelect'));

		const $input = new InputBox(append($parent, $('.text')), this.contextViewService, {
			type: 'text',
		});
		template.toDispose.push(attachInputBoxStyler($input, this.themeService, {
			inputBackground: 'transparent',
		}));

		const $button = new Button(append($parent, $('.browse')));
		template.toDispose.push(attachButtonStyler($button, this.themeService));
		$button.label = '...';

		template.toDispose.push(
			$button.onDidClick(async () => {
				if (!template.context) {
					return;
				}
				const items = await await this.windowsService.showOpenDialog(0, {
					title: 'Select Path', // ?: string;
					defaultPath: $input.value || undefined, // ?: string;
					// buttonLabel:, // ?: string;
					// filters:, // ?: FileFilter[];
					properties: [template.context.setting.type === 'file' ? 'openFile' : 'openDirectory'], // ?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory'>;
					message: '', // ?: string;
				});
				if (items && items.length) {
					$input.value = items[0];
				}
			}),
		);

		template.toDispose.push($input);
		template.toDispose.push($button);

		template.toDispose.push(
			$input.onDidChange(e => {
				this.fireChangeEvent(template, e);
			}));

		return {
			$input,
		};
	}

	_entry(tree, element: SettingsTreeSettingElement, template: FieldTemplate<string, Template>): void {
		if (!template.context) {
			template.$input.setEnabled(false);
		} else {
			template.$input.setEnabled(true);
			template.$input.setPlaceHolder(element.description);
			template.$input.value = element.value;
		}
	}

	_detect(element) {
		return element.setting.type === 'file' || element.setting.type === 'folder';
	}
}