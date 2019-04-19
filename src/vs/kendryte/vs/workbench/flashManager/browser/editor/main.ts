import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import {
	ACTION_ID_FLASH_MANGER_CREATE_ZIP,
	ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM,
	ACTION_ID_FLASH_MANGER_FLASH_ALL,
	FlashManagerFocusContext,
	KENDRYTE_FLASH_MANAGER_ID,
	KENDRYTE_FLASH_MANAGER_TITLE,
} from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { $, append, Dimension, getTotalHeight, trackFocus } from 'vs/base/browser/dom';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { FlashSectionDelegate, FlashSectionRender } from 'vs/kendryte/vs/workbench/flashManager/browser/editor/list';
import { IFlashManagerConfigJsonReadonly, IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { Button } from 'vs/base/browser/ui/button/button';
import { attachButtonStyler, attachStyler } from 'vs/platform/theme/common/styler';
import { localize } from 'vs/nls';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { vscodeIcon } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import 'vs/css!vs/kendryte/vs/workbench/flashManager/browser/meida/style';
import { FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/workbench/serialUpload/common/chipDefine';
import { listErrorForeground } from 'vs/platform/theme/common/colorRegistry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { createActionInstance } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { humanSize } from 'vs/kendryte/vs/base/common/speedShow';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';

export class FlashManagerEditor extends BaseEditor {
	public static readonly ID: string = KENDRYTE_FLASH_MANAGER_ID;

	protected _input: FlashManagerEditorInput | null;
	private _inputEvents: IDisposable[] = [];
	private _parent: HTMLDivElement;
	private titleContainer: HTMLElement;
	private _lastDimension: Dimension;

	private information: HTMLSpanElement;
	private error: HTMLSpanElement;

	private btnAddFile: Button;
	private btnFlashAll: Button;
	private btnCreateZip: Button;
	private btnCreateZip2: Button;
	private sectionList: WorkbenchList<IFlashSection>;
	private baseAddressInput: InputBox;

	private readonly render: FlashSectionRender;
	private context: IContextKey<boolean>;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@INotificationService private readonly notificationService: INotificationService,
		@IContextKeyService contextKeyService: IContextKeyService,
	) {
		super(FlashManagerEditor.ID, telemetryService, themeService, storageService);

		this.context = FlashManagerFocusContext.bindTo(contextKeyService);
		this.render = this.instantiationService.createInstance(FlashSectionRender);
	}

	async setInput(input: FlashManagerEditorInput, options: EditorOptions | null, token: CancellationToken): Promise<void> {
		this.clearInput();
		this._inputEvents.push(input.onItemUpdate((indexes) => {
			for (const index of indexes) {
				this.updateSingleLine(index);
			}
			this.updateErrorMessage(input.errorMessage, input.modelData);
		}));
		this._inputEvents.push(input.onItemDelete((index) => {
			this.updateSingleLine(index, true);
			this.updateErrorMessage(input.errorMessage, input.modelData);
		}));
		this._inputEvents.push(input.onReload(() => {
			this.refreshPage(input.modelData);
			this.updateErrorMessage(input.errorMessage, input.modelData);
		}));
		this._inputEvents.push(this.render.onFieldChange(({ id, field, value }) => {
			assertNotNull(input).changeSectionFieldValue(id, field, value);
		}));
		this._inputEvents.push(this.render.onDelete((id) => {
			assertNotNull(input).deleteItem(id);
		}));

		await input.resolve();
		return super.setInput(input, options, token);
	}

	public dispose(): void {
		this.clearInput();
		super.dispose();
	}

	clearInput() {
		if (this._inputEvents) {
			this._inputEvents = dispose(this._inputEvents);
		}
		this.sectionList.splice(0, this.sectionList.length);
		this.btnAddFile.enabled = false;
		this.btnFlashAll.enabled = false;
		super.clearInput();
	}

	public layout(dimension: Dimension = this._lastDimension): void {
		if (!dimension) {
			return;
		}
		this._lastDimension = dimension;

		const w = Math.min(dimension.width, 800);
		Object.assign(this._parent.style, {
			height: dimension.height + 'px',
			width: w + 'px',
		});

		this.sectionList.layout(dimension.height - getTotalHeight(this.titleContainer), w);
	}

	protected createEditor(parent: HTMLElement): void {
		const focusTracker = this._register(trackFocus(parent));
		this._register(focusTracker.onDidFocus(() => {
			this.context.set(true);
		}));
		this._register(focusTracker.onDidBlur(() => {
			this.context.set(false);
		}));

		this._parent = append(parent, $('div.subContainer'));

		this.titleContainer = append(this._parent, $('div.titlebar'));
		const h1 = append(this.titleContainer, $('h1.padding'));
		h1.textContent = KENDRYTE_FLASH_MANAGER_TITLE;

		const buttonBar = append(this.titleContainer, $('div.buttonBar'));
		this.createButtonBar(buttonBar);

		this.information = append(this.titleContainer, $('span.information'));

		this.error = append(this._parent, $('div.error'));
		attachStyler(this.themeService, { foreground: listErrorForeground }, (c) => {
			if (c.foreground) {
				this.error.style.color = c.foreground.toString();
			}
		});

		this.sectionList = this._register(this.instantiationService.createInstance(
			WorkbenchList,
			append(this._parent, $('div.listContainer')),
			new FlashSectionDelegate,
			[this.render],
			{
				identityProvider: { getId(e: IFlashSection) {return e.name;} },
				multipleSelectionSupport: false,
				keyboardSupport: false,
				supportDynamicHeights: false,
				mouseSupport: false,
				horizontalScrolling: false,
			},
		) as WorkbenchList<IFlashSection>);
	}

	private createButtonBar(parent: HTMLElement) {
		const addButton = this.btnAddFile = this._register(new Button(parent, {}));
		this._register(attachButtonStyler(addButton, this.themeService));
		append(addButton.element, vscodeIcon('AddFile'));
		append(addButton.element, $('span')).textContent = localize('addFile', 'Add file...');

		this._register(addButton.onDidClick(() => {
			assertNotNull(this._input).createNewSection();
		}));

		const zipPlace = append(parent, $('div.createButton'));
		const createZipButton = this.btnCreateZip = this._register(new Button(zipPlace, {}));
		this._register(attachButtonStyler(createZipButton, this.themeService));
		createZipButton.element.innerHTML = renderOcticons('$(file-zip) ' + localize('createZip', 'Create Zip'));
		createZipButton.element.title = localize('createZipDesc', 'Create K-Flash package (.kfpkg) file from listed file');
		this._register(createZipButton.onDidClick(() => {
			return this.saveAndRun(ACTION_ID_FLASH_MANGER_CREATE_ZIP);
		}));

		const createZipButton2 = this.btnCreateZip2 = this._register(new Button(zipPlace, {}));
		this._register(attachButtonStyler(createZipButton2, this.themeService));
		createZipButton2.element.innerHTML = renderOcticons('$(file-zip) ' + localize('createZipWithProgram', 'Create zip (with program)'));
		createZipButton2.element.classList.add('alter');
		this._register(createZipButton2.onDidClick(() => {
			return this.saveAndRun(ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM);
		}));

		const flashAllButton = this.btnFlashAll = this._register(new Button(parent, {}));
		this._register(attachButtonStyler(flashAllButton, this.themeService));
		flashAllButton.element.innerHTML = renderOcticons('$(desktop-download) ' + localize('flashAll', 'Flash all files'));

		this._register(flashAllButton.onDidClick(() => {
			return this.saveAndRun(ACTION_ID_FLASH_MANGER_FLASH_ALL);
		}));

		append(parent, $('div.spacer'));

		const baseAddressInput = this.baseAddressInput = this._register(new InputBox(parent, this.contextViewService, {}));
		baseAddressInput.element.title = 'Not editable, please wait next IDE update.';
		baseAddressInput.disable();
	}

	private async saveAndRun(commandId: string, ...args: any[]) {
		if (!this._input) {
			this.notificationService.error('Flash section definitions file did not exists.');
			return;
		}
		const ret = await this._input.save().catch((err) => {
			this.notificationService.error('cannot save flash section definitions file: ' + err.message);
			return false;
		});
		if (!ret) {
			return;
		}

		return createActionInstance(this.instantiationService, commandId).run(this._input.getResource().fsPath).catch((err) => {
			this.notificationService.error('cannot run command: ' + err.message);
		});
	}

	private updateErrorMessage(errorMessage: string, data: IFlashManagerConfigJsonReadonly) {
		if (errorMessage) {
			this.btnFlashAll.enabled = false;
			this.btnCreateZip.enabled = false;
			this.btnCreateZip2.enabled = false;
			this.error.textContent = errorMessage;
		} else {
			this.btnFlashAll.enabled = data.downloadSections.length > 0;
			this.btnCreateZip.enabled = data.downloadSections.length > 0;
			this.btnCreateZip2.enabled = data.downloadSections.length > 0;
			this.error.textContent = '';
		}

		this.information.textContent = localize(
			'informationMessage',
			'{0} files, {1} data, write flash: {2} to {3}',
			data.downloadSections.length,
			humanSize(data.totalSize),
			'0x' + FLASH_SAFE_ADDRESS.toString(16).toUpperCase(),
			'0x' + (FLASH_SAFE_ADDRESS + data.totalSize).toString(16).toUpperCase(),
		);

		this.baseAddressInput.value = data.baseAddress;

		this.layout();
	}

	private refreshPage(data: IFlashManagerConfigJsonReadonly) {
		this.sectionList.splice(0, this.sectionList.length, data.downloadSections.map((item) => {
			return { ...item };
		}));

		this.btnAddFile.enabled = true;
	}

	private updateSingleLine(modelIndex: number, remove = false) {
		const newOne = assertNotNull(this._input).modelData.downloadSections[modelIndex];
		console.log('splice(%s, %s, ?%s)', modelIndex, 1, true);
		this.sectionList.splice(modelIndex, 1, remove ? [] : [{ ...newOne }]);
	}
}