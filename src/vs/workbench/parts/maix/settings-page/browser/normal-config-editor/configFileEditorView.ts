import { $, append, findParentWithClass, getContentHeight, getDomNodePagePosition } from 'vs/base/browser/dom';
import { IDelegate } from 'vs/base/browser/ui/list/list';
import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Delayer } from 'vs/base/common/async';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import 'vs/css!../media/list';
import { localize } from 'vs/nls';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ICanRender } from 'vs/workbench/parts/maix/settings-page/browser/frame/mySplitView';
import { createConfigFileEditorRender, IConfigListEntry, ISettingArrayItem, ISettingItemEntry, ListMode } from 'vs/workbench/parts/maix/settings-page/browser/ui/EditListView';
import { createSplitRenderInstance, ISplitEntry } from 'vs/workbench/parts/maix/settings-page/browser/frame/splitRender';
import { ITitle, MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/settings-page/common/preferencesModels';
import { SettingsTarget, SettingsTargetsWidget } from 'vs/workbench/parts/preferences/browser/preferencesWidgets';
import { ISetting } from 'vs/workbench/services/preferences/common/preferences';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { ILogService } from 'vs/platform/log/common/log';

const SETTINGS_ENTRY_TEMPLATE_ID = 'ConfigFileEditorRender';
const SETTINGS_ARRAY_TEMPLATE_ID = 'ConfigFileEditorRenderArray';
const SPLIT_TEMPLATE_ID = 'SplitRenderer';

export class ConfigFileEditorView extends Disposable implements IView, ICanRender {
	element: HTMLElement;
	minimumSize = 450;
	maximumSize = Infinity;
	onDidChange = Event.None;

	private settingsList: WorkbenchList<IConfigListEntry>;
	private settingsTargetsWidget: SettingsTargetsWidget;
	private delayedModifyLogging: Delayer<void>;

	private defaultSettingsEditorModel: MySettingsEditorModelWrapper;
	private settingsListContainer: HTMLElement;
	private headerContainer: HTMLElement;

	constructor(
		@ITelemetryService private telemetryService: ITelemetryService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ILogService private log: ILogService,
	) {
		super();

		this.element = $('.settings-editor');

		// user / workspace
		this.headerContainer = append(this.element, $('.settings-header'));
		const headerControlsContainer = append(this.headerContainer, $('.settings-header-controls'));
		const targetWidgetContainer = append(headerControlsContainer, $('.settings-target-container'));

		this.settingsTargetsWidget = this._register(instantiationService.createInstance(SettingsTargetsWidget, targetWidgetContainer));
		this.settingsTargetsWidget.settingsTarget = ConfigurationTarget.USER;
		this.settingsTargetsWidget.onDidTargetChange(e => this.renderEntries());

		this.delayedModifyLogging = new Delayer<void>(1000);

		// settings list
		const $body = append(this.element, $('.settings-body'));
		const settingItemRenderer = createConfigFileEditorRender(instantiationService, ListMode.FULL);
		this._register(settingItemRenderer.onDidChangeSetting(e => this.onDidChangeSetting(e.key, e.value)));

		const splitRender = createSplitRenderInstance(instantiationService);

		this.settingsListContainer = append($body, $('.settings-list-container'));
		this.settingsList = this._register(instantiationService.createInstance(
			WorkbenchList,
			this.settingsListContainer,
			new SettingItemDelegate(),
			[settingItemRenderer, splitRender],
			{
				identityProvider: e => e.id,
				ariaLabel: localize('settingsListLabel', 'Settings'),
				focusOnMouseDown: false,
				selectOnMouseDown: false,
				keyboardSupport: false,
				mouseSupport: false
			}
		)
		) as WorkbenchList<IConfigListEntry>;

		this.settingsList.style({ listHoverBackground: Color.transparent, listFocusOutline: Color.transparent });
	}

	layout(width: number) {
		const listHeight = getContentHeight(this.element.parentElement) - (getDomNodePagePosition(this.headerContainer).height + 12 /*padding*/);
		this.settingsListContainer.style.height = `${listHeight}px`;
		this.settingsList.layout(listHeight);
	}

	async renderEntries() {
		const focusedRowItem = findParentWithClass(<HTMLElement>document.activeElement, 'monaco-list-row');
		const focusedRowId = focusedRowItem && focusedRowItem.id;

		const entries = await this.getEntriesFromModel();

		this.settingsList.splice(0, this.settingsList.length, entries);

		// Hack to restore the same focused element after editing.
		// TODO@roblou figure out the whole keyboard navigation story
		if (focusedRowId) {
			const rowSelector = `.monaco-list-row#${focusedRowId}`;
			const inputElementToFocus: HTMLElement = this.element.querySelector(`${rowSelector} input, ${rowSelector} select`);
			this.log.debug('re-select: ', focusedRowId, inputElementToFocus);
			if (inputElementToFocus) {
				inputElementToFocus.focus();
			}
		}
	}

	private async getEntriesFromModel() {
		await this.defaultSettingsEditorModel.wait();

		const entries: IConfigListEntry[] = [];
		for (const setting of this.defaultSettingsEditorModel.settings) {
			if (setting.hasOwnProperty('title')) {
				entries.push(this.titleToEntry(setting as ITitle));
			} else {
				entries.push(this.settingToEntry(setting as ISetting));
			}
		}

		return entries;
	}

	private settingToEntry({ ...s }: ISetting): ISettingItemEntry {
		const targetSelector = this.settingsTargetsWidget.settingsTarget === ConfigurationTarget.USER ? 'user' : 'workspace';
		const inspected = this.configurationService.inspect(s.key);
		const isConfigured = typeof inspected[targetSelector] !== 'undefined';
		const displayValue = isConfigured ? inspected[targetSelector] : inspected.default;
		const overriddenScopeList = [];
		if (targetSelector === 'user' && typeof inspected.workspace !== 'undefined') {
			overriddenScopeList.push('Workspace');
		}

		if (targetSelector === 'workspace' && typeof inspected.user !== 'undefined') {
			overriddenScopeList.push('User');
		}
		if (Array.isArray(s.type)) { // eg: ['string', null]
			const reg = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).getConfigurationProperties()[s.key];
			if (reg) {
				if (s.type.indexOf('string') !== -1) {
					s.type = 'string';
					if (reg.enum) {
						s.enum = reg.enum;
					}
				} else if (s.type.indexOf('file') !== -1) {
					s.type = 'file';
				}
			} else {
				this.log.warn('missing config', s);
				s.type = s.type.filter((type) => {
					return type && type !== 'undefined' && type !== 'null';
				}).shift();
			}
		}

		const reg = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).getConfigurationProperties()[s.key];
		let arrayType: ISettingArrayItem;
		if (s.type === 'array') {
			if (reg.items) {
				if (Array.isArray(reg.items)) {
					this.log.warn('complex config', s);
				} else {
					arrayType = {
						id: reg.items.id,
						key: s.key,
						description: reg.items.description,
						enum: reg.items.enum,
						type: reg.items.type,
						templateId: SETTINGS_ENTRY_TEMPLATE_ID,
					};
				}
			}
		}

		return <ISettingItemEntry>{
			title: reg.title,
			id: s.key,
			key: s.key,
			value: displayValue,
			isConfigured,
			overriddenScopeList,
			description: s.description.join('\n'),
			enum: s.enum,
			enumSource: (reg as any).enumSource,
			enumEditable: (reg as any).enumEditable,
			type: s.type,
			templateId: s.type === 'array' ? SETTINGS_ARRAY_TEMPLATE_ID : SETTINGS_ENTRY_TEMPLATE_ID,
			arrayType,
		};
	}

	private titleToEntry(s: ITitle): ISplitEntry {
		return {
			id: '',
			title: s.title,
			templateId: SPLIT_TEMPLATE_ID,
		};
	}

	private pendingSettingModifiedReport: { key: string, value: any };

	private onDidChangeSetting(key: string, value: any): void {
		// ConfigurationService displays the error if this fails.
		// Force a render afterwards because onDidConfigurationUpdate doesn't fire if the update doesn't result in an effective setting value change
		this.configurationService.updateValue(key, value, <ConfigurationTarget>this.settingsTargetsWidget.settingsTarget);

		const reportModifiedProps = {
			key,
			isReset: typeof value === 'undefined',
			settingsTarget: this.settingsTargetsWidget.settingsTarget as SettingsTarget
		};

		if (this.pendingSettingModifiedReport && key !== this.pendingSettingModifiedReport.key) {
			this.reportModifiedSetting(reportModifiedProps);
		}

		this.pendingSettingModifiedReport = { key, value };
		this.delayedModifyLogging.trigger(() => this.reportModifiedSetting(reportModifiedProps));
	}

	private reportModifiedSetting(props: { key: string, isReset: boolean, settingsTarget: SettingsTarget }): void {
		this.pendingSettingModifiedReport = null;

		let groupId = undefined;
		let nlpIndex = undefined;
		let displayIndex = undefined;

		const reportedTarget = props.settingsTarget === ConfigurationTarget.USER ? 'user' : props.settingsTarget === ConfigurationTarget.WORKSPACE ? 'workspace' : 'folder';

		const data = {
			key: props.key,
			groupId,
			nlpIndex,
			displayIndex,
			isReset: props.isReset,
			target: reportedTarget
		};

		this.telemetryService.publicLog('settingEditor.settingModified', data);
	}

	public updateModel(model: MySettingsEditorModelWrapper) {
		this.defaultSettingsEditorModel = model;
		this.renderEntries();
	}
}

class SettingItemDelegate implements IDelegate<IConfigListEntry> {
	getHeight(entry: IConfigListEntry) {
		if (entry.templateId === SETTINGS_ENTRY_TEMPLATE_ID) {
			return 75;
		} else if (entry.templateId === SETTINGS_ARRAY_TEMPLATE_ID) {
			return 240;
		} else if (entry.templateId === SPLIT_TEMPLATE_ID) {
			return 38;
		}
		return 0;
	}

	getTemplateId(element: IConfigListEntry) {
		if (element.templateId === SETTINGS_ARRAY_TEMPLATE_ID) {
			return SETTINGS_ENTRY_TEMPLATE_ID;
		}
		return element.templateId;
	}
}
