import { IDelegate, IRenderer } from 'vs/base/browser/ui/list/list';
import { Emitter, Event } from 'vs/base/common/event';
import { attachButtonStyler, attachInputBoxStyler, attachListStyler } from 'vs/platform/theme/common/styler';
import { createDecorator, IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { Disposable, dispose, IDisposable } from 'vs/base/common/lifecycle';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Button } from 'vs/base/browser/ui/button/button';
import { Color } from 'vs/base/common/color';
import { settingKeyToDisplayFormat } from 'vs/workbench/parts/preferences/browser/settingsEditor2';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IMessage, InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { $, addClass, addDisposableListener, append, findParentWithClass, toggleClass } from 'vs/base/browser/dom';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { ILogService } from 'vs/platform/log/common/log';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { attachEditableSelectBoxStyler, EditableSelectBox } from 'vs/workbench/parts/maix/settings-page/browser/ui/editableSelect';
import { array_has_diff, object_has_diff } from 'vs/workbench/parts/maix/settings-page/common/utils';
import { EnumProviderService } from 'vs/workbench/parts/maix/settings-page/common/type';

export interface BaseEditableItem {
	id: string;
}

const SETTINGS_ENTRY_TEMPLATE_ID = 'ConfigFileEditorRender';

class PrivateDelegate<T> implements IDelegate<T> {
	getHeight(entry: T) {
		return 29;
	}

	getTemplateId(element: T) {
		return SETTINGS_ENTRY_TEMPLATE_ID;
	}
}

let focusedRowId = '';

export class EditListView<T extends BaseEditableItem> extends Disposable {
	private _onDidChange = this._register(new Emitter<string[]>());
	public readonly onDidChange: Event<string[]> = this._onDidChange.event;
	private _value: string[] = [];

	private workbenchList: WorkbenchList<T>;

	constructor(
		private entry: T,
		private container: HTMLElement,
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService themeService: IThemeService,
		@ILogService private log: ILogService,
	) {
		super();

		const inputRender = instantiationService.createInstance(ConfigFileEditorRender, ListMode.INPUT);
		this._register(inputRender.onDidChangeSetting(e => {
			const copy = this.value.slice();
			copy[e.key] = e.value;
			const valid = copy.filter(e => !!e);
			this.log.debug('trigger:', valid);
			this._onDidChange.fire(valid);
			this.value = valid;
		}));

		this.workbenchList = instantiationService.createInstance(
			WorkbenchList,
			container,
			new PrivateDelegate(),
			[inputRender],
			{
				identityProvider: e => e.id,
				ariaLabel: localize('settingsListLabel', 'Settings'),
				focusOnMouseDown: true,
				selectOnMouseDown: true,
				keyboardSupport: false,
				mouseSupport: false
			},
		) as WorkbenchList<T>;

		this._register(attachListStyler(this.workbenchList, themeService));
	}

	public get value(): string[] {
		this.log.debug('get:', this._value);
		return this._value;
	}

	public set value(newValue: string[]) {
		this.log.debug('set:', newValue);
		this._value = newValue;
		const entriesList = newValue.map((value, index) => {
			return {
				...(this.entry as any),
				id: index,
				key: index,
				value,
			};
		});
		entriesList.push({
			...(this.entry as any),
			id: entriesList.length,
			key: entriesList.length,
			value: '',
			description: 'Write Here to Create, Leave empty to remove.',
		});

		const focusedRowItem = findParentWithClass(<HTMLElement>document.activeElement, 'monaco-list-row');
		if (focusedRowItem && focusedRowItem.id) {
			focusedRowId = focusedRowItem && focusedRowItem.id;
		}

		this.log.debug('entries: ', entriesList);
		this.workbenchList.splice(0, this.workbenchList.length, entriesList);

		if (focusedRowId) {
			const rowSelector = `.monaco-list-row#${focusedRowId}`;
			const inputElementToFocus: HTMLElement = this.container.querySelector(`${rowSelector} input, ${rowSelector} select`);
			if (inputElementToFocus) {
				inputElementToFocus.focus();
			}
		}
	}

	layout(height: number) {
		this.workbenchList.layout(height);
	}
}

export interface IConfigListEntry {
	id: string;
	templateId: string;
}

export interface ISettingItemEntry<T = any> extends IConfigListEntry {
	title: string;
	key: string;
	value: T;
	isConfigured: boolean;
	description: string;
	overriddenScopeList: string[];
	type?: string | string[];
	enum?: string[];
	enumSource?: string;
	enumEditable?: boolean;
	arrayType?: ISettingArrayItem;
}

export interface ISettingArrayItem extends Pick<ISettingItemEntry, 'id' | 'key' | 'description' | 'enum' | 'enumSource' | 'type' | 'templateId'> {

}

interface IDisposableTemplate {
	toDispose: IDisposable[];
}

interface ISettingItemTemplate extends IDisposableTemplate {
	parent: HTMLElement;
	valueElement: HTMLElement;
	lastId?: string;
	valueNotify?: ValueNotify;
	labelElement?: HTMLElement;
	descriptionElement?: HTMLElement;
	overridesElement?: HTMLElement;
}

export interface ISettingChangeEvent {
	key: string;
	value: any; // undefined => reset unconfigure
}

export enum ListMode {
	INPUT,
	FULL,
}

export interface IConfigFileEditorRender {
	readonly onDidChangeSetting: Event<ISettingChangeEvent>;
}

export function createConfigFileEditorRender(instantiationService: IInstantiationService, mode: ListMode): IConfigFileEditorRender {
	return instantiationService.createInstance(ConfigFileEditorRender, mode);
}

class ConfigFileEditorRender implements IRenderer<ISettingItemEntry, ISettingItemTemplate>, IConfigFileEditorRender {
	private _onDidChangeSetting: Emitter<ISettingChangeEvent> = new Emitter<ISettingChangeEvent>();
	public readonly onDidChangeSetting: Event<ISettingChangeEvent> = this._onDidChangeSetting.event;

	constructor(
		private mode: ListMode,
		@IContextViewService protected contextViewService: IContextViewService,
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IThemeService protected themeService: IThemeService,
		@IWindowsService protected windowsService: IWindowsService,
		@ILogService private log: ILogService,
		@ICommandService private commandService: ICommandService,
	) {
	}

	get templateId(): string {
		return SETTINGS_ENTRY_TEMPLATE_ID;
	}

	renderTemplate(parent: HTMLElement): ISettingItemTemplate {
		this.log.debug('newTemplate.');
		addClass(parent, 'setting-item');
		const valueNotify = new ValueNotify(this.log);

		if (this.mode === ListMode.FULL) {
			const itemContainer = append(parent, $('.setting-item-container'));
			const leftElement = append(itemContainer, $('.setting-item-left'));
			const rightElement = append(itemContainer, $('.setting-item-right'));

			const titleElement = append(leftElement, $('.setting-item-title'));
			const labelElement = append(titleElement, $('span.setting-item-label'));
			const overridesElement = append(titleElement, $('span.setting-item-overrides'));
			const descriptionElement = append(leftElement, $('.setting-item-description'));

			const valueElement = append(rightElement, $('.setting-item-value'));

			return {
				parent,
				toDispose: [],

				valueElement,
				labelElement,
				descriptionElement,
				overridesElement,

				valueNotify,
			};
		} else {
			const valueElement = append(parent, $('.setting-item-value'));

			return {
				parent,
				toDispose: [],

				valueElement,

				valueNotify,
			};
		}
	}

	renderElement(entry: ISettingItemEntry, index: number, template: ISettingItemTemplate): void {
		toggleClass(template.parent, 'odd', index % 2 === 1);

		if (entry.id === template.lastId) {
			this.log.debug('render: reuse: %s', entry.key);
			return template.valueNotify.notify(entry.value, entry.key);
		} else {
			this.log.debug('render: create new: %s -> %s', template.lastId, entry.key);
			template.valueElement.innerText = '';
			template.valueElement.className = 'setting-item-value';
			dispose(template.toDispose);
			template.toDispose.length = 0;
		}
		template.lastId = entry.id;

		template.toDispose.push(
			template.valueNotify.onInnerChange((value) => {
				this._onDidChangeSetting.fire({ key: entry.key, value });
			})
		);

		if (entry.enum || entry.enumSource) {
			template.parent.setAttribute('data-type', 'enum');
		} else {
			template.parent.setAttribute('data-type', Array.isArray(entry.type) ? entry.type.join(';') : entry.type);
		}
		template.parent.setAttribute('data-key', entry.key);
		template.parent.setAttribute('data-id', entry.id);

		if (this.mode === ListMode.FULL) {
			let titleTooltip = entry.key;
			if (entry.isConfigured) {
				titleTooltip += ' - ' + localize('configuredTitleToolip', 'This setting is configured');
			}

			template.labelElement.textContent = entry.title || settingKeyToDisplayFormat(entry.key).label;
			template.labelElement.title = titleTooltip;
			template.descriptionElement.textContent = entry.description;
			template.descriptionElement.title = entry.description;

			this.renderEntry(entry, template);

			const alsoConfiguredInLabel = localize('alsoConfiguredIn', 'Also configured in:');
			template.overridesElement.textContent = entry.overriddenScopeList.length ? `(${alsoConfiguredInLabel} ${entry.overriddenScopeList.join(', ')})` : '';
		} else {
			this.renderEntry(entry, template);
		}
	}

	private renderResetButton(entry: ISettingItemEntry, template: ISettingItemTemplate) {
		toggleClass(template.parent, 'is-configured', entry.isConfigured);
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
	}

	private renderEntry(entry: ISettingItemEntry, template: ISettingItemTemplate) {
		if (entry.type === 'string' && entry.enum) {
			this.renderEnum(entry, template, template.valueNotify);
		} else if (entry.type === 'string' && entry.enumSource) {
			this.renderDynamicEnum(entry, template, template.valueNotify);
		} else if (entry.type === 'boolean') {
			this.renderBool(entry, template, template.valueNotify);
		} else if (entry.type === 'string') {
			this.renderText(entry, template, template.valueNotify);
		} else if (entry.type === 'integer') {
			this.renderNumber(entry, template, parseInt, template.valueNotify);
		} else if (entry.type === 'number') {
			this.renderNumber(entry, template, parseFloat, template.valueNotify);
		} else if (entry.type === 'file' || entry.type === 'folder') {
			this.renderFile(entry, template, template.valueNotify);
		} else if (entry.type === 'array') {
			this.renderArray(entry, template, template.valueNotify);
		} else if (entry.type === 'button') {
			this.renderButton(entry, template);
		} else {
			console.log(this.log.getLevel());
			this.log.error('Unknown Type:', entry);
		}
		if (this.mode === ListMode.FULL) {
			this.renderResetButton(entry, template);
		}
	}

	private renderBool(entry: ISettingItemEntry, template: ISettingItemTemplate, notify: ValueNotify) {
		const checkboxElement = <HTMLInputElement>append(template.valueElement, $('input.setting-value-checkbox.setting-value-input'));
		checkboxElement.type = 'checkbox';
		checkboxElement.checked = entry.value;

		template.toDispose.push(addDisposableListener(checkboxElement, 'change', e => {
			notify.updated(checkboxElement.checked, entry.key);
		}));
		template.toDispose.push(
			notify.onOuterChange(val => checkboxElement.checked = val));

		return checkboxElement;
	}

	private renderDynamicEnum(entry: ISettingItemEntry, template: ISettingItemTemplate, notify: ValueNotify) {
		const input = new EditableSelectBox(template.valueElement, this.contextViewService);
		template.toDispose.push(input);
		template.toDispose.push(attachEditableSelectBoxStyler(input, this.themeService));

		template.toDispose.push(input.onDidChange(e => {
			notify.updated(e, entry.key);
		}));
		template.toDispose.push(notify.onOuterChange((val: string) => {
			input.value = val;
		}));

		const IDecorator = typeof entry.enumSource === 'string' ? createDecorator(entry.enumSource) : entry.enumSource;

		const service: EnumProviderService = this.instantiationService.invokeFunction((accessor: ServicesAccessor) => {
			return accessor.get(IDecorator);
		}) as EnumProviderService;
		template.toDispose.push(service.onChange((list) => {
			input.registerEnum(list);
		}));
		input.value = entry.value;
		input.registerEnum(service.getValues());

		return input;
	}

	private renderEnum(entry: ISettingItemEntry, template: ISettingItemTemplate, notify: ValueNotify) {
		const input = new EditableSelectBox(template.valueElement, this.contextViewService);
		template.toDispose.push(input);
		template.toDispose.push(attachEditableSelectBoxStyler(input, this.themeService));

		template.toDispose.push(input.onDidChange(e => {
			notify.updated(e, entry.key);
		}));
		template.toDispose.push(notify.onOuterChange((val: string) => {
			input.value = entry.enum[val];
		}));

		input.registerEnum(entry.enum);
		input.value = entry.value;

		return input;
	}

	private renderText(entry: ISettingItemEntry, template: ISettingItemTemplate, notify: ValueNotify) {
		const inputBox = new InputBox(template.valueElement, this.contextViewService);
		template.toDispose.push(attachInputBoxStyler(inputBox, this.themeService));
		template.toDispose.push(inputBox);
		inputBox.value = entry.value || '';

		template.toDispose.push(
			inputBox.onDidChange(e => {
				notify.updated(e, entry.key);
			}));
		template.toDispose.push(
			notify.onOuterChange(val => {
				inputBox.value = val;
			}));

		return inputBox;
	}

	private renderNumber(
		entry: ISettingItemEntry,
		template: ISettingItemTemplate,
		parser: (value: string) => number,
		notify: ValueNotify,
	) {
		const inputBox = new InputBox(template.valueElement, this.contextViewService, {
			type: 'number',
			validationOptions: {
				validation(value: string): IMessage {
					if (value !== parser(value).toString()) {
						return { content: 'Value Not Number' };
					} else {
						return null;
					}
				},
			},
		});
		template.toDispose.push(attachInputBoxStyler(inputBox, this.themeService));
		template.toDispose.push(inputBox);
		inputBox.value = entry.value;

		template.toDispose.push(
			inputBox.onDidChange(e => {
				notify.updated(parser(e), entry.key);
			}));
		template.toDispose.push(
			notify.onOuterChange(val => inputBox.value = val));

		return inputBox;
	}

	private renderFile(entry: ISettingItemEntry, template: ISettingItemTemplate, notify: ValueNotify) {
		const $parent = append(template.valueElement, $('div.fileSelect'));

		const $input = new InputBox(append($parent, $('.text')), this.contextViewService, {
			placeholder: entry.description,
			type: 'text',
		});
		template.toDispose.push(attachInputBoxStyler($input, this.themeService, {
			inputBackground: 'transparent'
		}));
		$input.value = entry.value;

		const $button = new Button(append($parent, $('.browse')));
		template.toDispose.push(attachButtonStyler($button, this.themeService));
		$button.label = '...';

		template.toDispose.push(
			$button.onDidClick(async () => {
				const items = await await this.windowsService.showOpenDialog(0, {
					title: 'Select Path', // ?: string;
					defaultPath: $input.value || undefined, // ?: string;
					// buttonLabel:, // ?: string;
					// filters:, // ?: FileFilter[];
					properties: [entry.type === 'file' ? 'openFile' : 'openDirectory'], // ?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory'>;
					message: '', // ?: string;
				});
				if (items.length) {
					$input.value = items[0];
				}
			})
		);

		template.toDispose.push($input);
		template.toDispose.push($button);

		template.toDispose.push({
			dispose() {
			}
		});
		template.toDispose.push(
			$input.onDidChange(e => {
				notify.updated(e, entry.key);
			}));
		template.toDispose.push(
			notify.onOuterChange(val => $input.value = val));

		return $parent;
	}

	private renderArray(
		entry: ISettingItemEntry<string[]>,
		template: ISettingItemTemplate,
		notify: ValueNotify,
	) {
		const listBox = this.instantiationService.createInstance(EditListView, entry.arrayType, template.valueElement);
		template.toDispose.push(listBox);
		listBox.value = entry.value;
		listBox.layout(template.valueElement.parentElement.clientHeight);

		template.toDispose.push(
			listBox.onDidChange(e => {
				notify.updated(e, entry.key);
			}));
		template.toDispose.push(
			notify.onOuterChange(val => listBox.value = val));

		return listBox;
	}

	private renderButton(entry: ISettingItemEntry, template: ISettingItemTemplate) {
		const btn = new Button(template.valueElement);
		btn.label = entry.title;
		btn.element.classList.add('settings-button');
		attachButtonStyler(btn, this.themeService);

		template.toDispose.push(btn.onDidClick(e => {
			return this.commandService.executeCommand(entry.value);
		}));
		template.toDispose.push(btn);
	}

	disposeTemplate(template: ISettingItemTemplate): void {
		this.log.debug('disposeTemplate.');
		dispose(template.toDispose);
		template.toDispose.length = 0;
	}
}

class ValueNotify {
	private _onInnerChange = new Emitter<any>();
	readonly onInnerChange = this._onInnerChange.event;

	private _onOuterChange = new Emitter<any>();
	readonly onOuterChange = this._onOuterChange.event;

	protected cached: any;

	constructor(private log: ILogService) { }

	notify(value: any, debugKey: string) {
		if (this.cacheMismatch(value)) {
			this.log.debug('%s: notify: changed (%O -> %O)', debugKey, this.cached, value);
			this.cached = value;
			this._onOuterChange.fire(value);
		} else {
			this.log.debug('%s: notify: not changed (%O -> %O)', debugKey, this.cached, value);
		}
	}

	updated(value: any, debugKey: string) {
		if (this.cacheMismatch(value)) {
			this.log.debug('%s: updated: changed (%O -> %O)', debugKey, this.cached, value);
			this.cached = value;
			this._onInnerChange.fire(value);
		} else {
			this.log.debug('%s: updated: not changed (%O -> %O)', debugKey, this.cached, value);
		}
	}

	private cacheMismatch(value: any) {
		if (Array.isArray(value) && this.cached) {
			return array_has_diff(value, this.cached);
		}
		if (value && typeof value === 'object' && this.cached) {
			return object_has_diff(value, this.cached);
		}
		return value !== this.cached;
	}
}
