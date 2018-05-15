import * as DOM from 'vs/base/browser/dom';
import { Button } from 'vs/base/browser/ui/button/button';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IRenderer } from 'vs/base/browser/ui/list/list';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { Color } from 'vs/base/common/color';
import { Emitter, Event } from 'vs/base/common/event';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachButtonStyler, attachInputBoxStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { settingKeyToDisplayFormat } from 'vs/workbench/parts/preferences/browser/settingsEditor2';

const $ = DOM.$;

export interface IConfigListEntry {
	id: string;
	templateId: string;
}

export interface ISettingItemEntry extends IConfigListEntry {
	key: string;
	value: any;
	isConfigured: boolean;
	description: string;
	overriddenScopeList: string[];
	type?: string | string[];
	enum?: string[];
}

interface IDisposableTemplate {
	toDispose: IDisposable[];
}

interface ISettingItemTemplate extends IDisposableTemplate {
	parent: HTMLElement;

	containerElement: HTMLElement;
	categoryElement: HTMLElement;
	labelElement: HTMLElement;
	descriptionElement: HTMLElement;
	valueElement: HTMLElement;
	overridesElement: HTMLElement;
}

export interface ISettingChangeEvent {
	key: string;
	value: any; // undefined => reset unconfigure
}

const SETTINGS_ENTRY_TEMPLATE_ID = 'ConfigFileEditorRender';

class ConfigFileEditorRender implements IRenderer<ISettingItemEntry, ISettingItemTemplate> {
	public readonly onDidChangeSetting: Event<ISettingChangeEvent> = this._onDidChangeSetting.event;

	get templateId(): string {
		return SETTINGS_ENTRY_TEMPLATE_ID;
	}

	constructor(
		private readonly _onDidChangeSetting: Emitter<ISettingChangeEvent>,
		@IContextViewService private contextViewService: IContextViewService,
		@IThemeService private themeService: IThemeService
	) {
	}

	renderTemplate(parent: HTMLElement): ISettingItemTemplate {
		DOM.addClass(parent, 'setting-item');

		const itemContainer = DOM.append(parent, $('.setting-item-container'));
		const leftElement = DOM.append(itemContainer, $('.setting-item-left'));
		const rightElement = DOM.append(itemContainer, $('.setting-item-right'));

		const titleElement = DOM.append(leftElement, $('.setting-item-title'));
		const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
		const labelElement = DOM.append(titleElement, $('span.setting-item-label'));
		const overridesElement = DOM.append(titleElement, $('span.setting-item-overrides'));
		const descriptionElement = DOM.append(leftElement, $('.setting-item-description'));

		const valueElement = DOM.append(rightElement, $('.setting-item-value'));

		return {
			parent: parent,
			toDispose: [],

			containerElement: itemContainer,
			categoryElement,
			labelElement,
			descriptionElement,
			valueElement,
			overridesElement
		};
	}

	renderElement(entry: ISettingItemEntry, index: number, template: ISettingItemTemplate): void {
		DOM.toggleClass(template.parent, 'odd', index % 2 === 1);

		let titleTooltip = entry.key;
		if (entry.isConfigured) {
			titleTooltip += ' - ' + localize('configuredTitleToolip', 'This setting is configured');
		}

		const settingKeyDisplay = settingKeyToDisplayFormat(entry.key);

		template.labelElement.textContent = settingKeyDisplay.label;
		template.labelElement.title = titleTooltip;
		template.descriptionElement.textContent = entry.description;
		template.descriptionElement.title = entry.description;

		DOM.toggleClass(template.parent, 'is-configured', entry.isConfigured);
		this.renderValue(entry, template);

		const resetButton = new Button(template.valueElement);
		resetButton.element.title = localize('resetButtonTitle', 'Reset');
		resetButton.element.classList.add('setting-reset-button');
		attachButtonStyler(resetButton, this.themeService, {
			buttonBackground: Color.transparent.toString(),
			buttonHoverBackground: Color.transparent.toString()
		});
		template.toDispose.push(resetButton.onDidClick(e => {
			this._onDidChangeSetting.fire({ key: entry.key, value: undefined });
		}));
		template.toDispose.push(resetButton);

		const alsoConfiguredInLabel = localize('alsoConfiguredIn', 'Also configured in:');
		template.overridesElement.textContent = entry.overriddenScopeList.length ? `(${alsoConfiguredInLabel} ${entry.overriddenScopeList.join(', ')})` :
			'';
	}

	private renderValue(entry: ISettingItemEntry, template: ISettingItemTemplate): void {
		const onChange = value => this._onDidChangeSetting.fire({ key: entry.key, value });
		template.valueElement.innerHTML = '';
		if (entry.type === 'string' && entry.enum) {
			this.renderEnum(entry, template, onChange);
		} else if (entry.type === 'boolean') {
			this.renderBool(entry, template, onChange);
		} else if (entry.type === 'string') {
			this.renderText(entry, template, onChange);
		} else if (entry.type === 'number') {
			this.renderText(entry, template, value => onChange(parseInt(value)));
		}
	}

	private renderBool(entry: ISettingItemEntry, template: ISettingItemTemplate, onChange: (value: boolean) => void): void {
		const checkboxElement = <HTMLInputElement>DOM.append(template.valueElement, $('input.setting-value-checkbox.setting-value-input'));
		checkboxElement.type = 'checkbox';
		checkboxElement.checked = entry.value;

		template.toDispose.push(DOM.addDisposableListener(checkboxElement, 'change', e => onChange(checkboxElement.checked)));
	}

	private renderEnum(entry: ISettingItemEntry, template: ISettingItemTemplate, onChange: (value: string) => void): void {
		const idx = entry.enum.indexOf(entry.value);
		const selectBox = new SelectBox(entry.enum, idx, this.contextViewService);
		template.toDispose.push(selectBox);
		template.toDispose.push(attachSelectBoxStyler(selectBox, this.themeService));
		selectBox.render(template.valueElement);

		template.toDispose.push(
			selectBox.onDidSelect(e => onChange(entry.enum[e.index])));
	}

	private renderText(entry: ISettingItemEntry, template: ISettingItemTemplate, onChange: (value: string) => void): void {
		const inputBox = new InputBox(template.valueElement, this.contextViewService);
		template.toDispose.push(attachInputBoxStyler(inputBox, this.themeService));
		template.toDispose.push(inputBox);
		inputBox.value = entry.value;

		template.toDispose.push(
			inputBox.onDidChange(e => onChange(e)));
	}

	disposeTemplate(template: ISettingItemTemplate): void {
		dispose(template.toDispose);
	}
}

export function createConfigFileEditorRenderInstance(
	instantiationService: IInstantiationService,
	onDidChangeSetting: Emitter<ISettingChangeEvent>
) {
	return instantiationService.createInstance(ConfigFileEditorRender, onDidChangeSetting) as any;
}

