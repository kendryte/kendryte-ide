import 'vs/css!vs/kendryte/vs/workbench/patchSettings2/browser/ui/fileSelect';
import { ISettingItemTemplate } from 'vs/workbench/contrib/preferences/browser/settingsTree';
import { SettingsTreeElement, SettingsTreeSettingElement } from 'vs/workbench/contrib/preferences/browser/settingsTreeModels';
import { AbstractSettingRenderer } from 'vs/workbench/contrib/preferences/browser/settingsTree';
import { ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { Event } from 'vs/base/common/event';
import { SettingsElementTypes, SettingsExtendType } from 'vs/kendryte/vs/workbench/patchSettings2/browser/typedFieldElementBase';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';

/*
interface Template {
	$input: InputBox;
}

export class FileInject implements ISettingsExtendType {
	public readonly templateId = 'settings.file.template';

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
				this.fireChangeEvent(template, {
					value: e,
					type: template.context ? template.context.valueType : SettingValueType.Null,
				});
			}));

		return {
			$input,
		};
	}

	_entry(tree: ITree, element: SettingsTreeSettingElement, template: FieldTemplate<string, Template>): void {
		if (!template.context) {
			template.$input.setEnabled(false);
		} else {
			template.$input.setEnabled(true);
			template.$input.setPlaceHolder(element.description);
			template.$input.value = element.value;
		}
	}

	_detect(element: SettingsTreeSettingElement) {
		return element.setting.type === 'file' || element.setting.type === 'folder';
	}

	public is(element: SettingsElementTypes): boolean {
		return false;
	}
}
*/
export class FileInject extends SettingsExtendType {
	ctor = new SyncDescriptor<FileSelectRenderer>(FileSelectRenderer).ctor;
	templateId = 'settings.file.template';

	public is(element: SettingsElementTypes): boolean {
		debugger;
		return element.valueType as any === 'file';
	}
}

class FileSelectRenderer extends AbstractSettingRenderer {
	onDidChangeTwistieState: Event<SettingsTreeElement>;

	disposeElement(element: ITreeNode<SettingsTreeElement, never>, index: number, templateData: any, dynamicHeightProbing?: boolean): void {
	}

	renderTwistie(element: SettingsTreeElement, twistieElement: HTMLElement): void {
	}

	renderValue(dataElement: SettingsTreeSettingElement, template: ISettingItemTemplate, onChange: (value: any) => void): void {
	}

	get templateId(): string {
		return '';
	}
}
