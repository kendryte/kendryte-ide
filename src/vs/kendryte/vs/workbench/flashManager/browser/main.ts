import 'vs/css!vs/kendryte/vs/workbench/flashManager/browser/style';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import {
	ACTION_ID_FLASH_MANGER_CREATE_ZIP,
	ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM,
	ACTION_ID_FLASH_MANGER_FLASH_ALL,
	FlashManagerFocusContext,
	IFlashSectionUI,
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
import { FlashSectionDelegate, FlashSectionRender } from 'vs/kendryte/vs/workbench/flashManager/browser/list';
import { Button } from 'vs/base/browser/ui/button/button';
import { attachButtonStyler, attachStyler } from 'vs/platform/theme/common/styler';
import { localize } from 'vs/nls';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { vscodeIcon } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { listErrorForeground } from 'vs/platform/theme/common/colorRegistry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { createActionInstance } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
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
	private sectionList: WorkbenchList<IFlashSectionUI>;
	private baseAddressInput: InputBox;

	private readonly render: FlashSectionRender;
	private context: IContextKey<boolean>;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IStorageService storageService: IStorageService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(FlashManagerEditor.ID, telemetryService, themeService, storageService);

		this.context = FlashManagerFocusContext.bindTo(contextKeyService);
		this.render = this.instantiationService.createInstance(FlashSectionRender);
	}

	async setInput(input: FlashManagerEditorInput, options: EditorOptions | null, token: CancellationToken): Promise<void> {
		if (this._input === input) {
			return;
		}
		this.clearInput();

		this.render.setNewRoot(input.rootPath);

		await input.resolve();
		await super.setInput(input, options, token);
		this.refreshFullList();
		this.refreshTitle();

		this._inputEvents.push(input.onReload(() => {
			this.refreshFullList();
			this.refreshTitle();
		}));

		this._inputEvents.push(input.onItemUpdate((itemIds) => {
			this.refreshLine(itemIds);
			this.refreshTitle();
		}));
		this._inputEvents.push(this.render.onFieldChange(({ id, field, value }) => {
			input.changeSectionFieldValue(id, field, value);
		}));
		this._inputEvents.push(this.render.onDeleteClick((id) => {
			const index = input.deleteItem(id);
			this.sectionList.splice(index, 1);
			// console.log('delete %s - %s', index, id);
		}));
		this._inputEvents.push(this.render.onMove(({ id, toDown }) => {
			const index = input.findSectionIndex(id);
			if (toDown) {
				this.onMoveItem(index, index + 1);
			} else {
				this.onMoveItem(index - 1, index);
			}
		}));
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
				identityProvider: { getId(e: IFlashSectionUI) {return e.name;} },
				multipleSelectionSupport: false,
				keyboardSupport: false,
				supportDynamicHeights: false,
				mouseSupport: false,
				horizontalScrolling: false,
			},
		) as WorkbenchList<IFlashSectionUI>);
	}

	private createButtonBar(parent: HTMLElement) {
		const addButton = this.btnAddFile = this._register(new Button(parent, {}));
		this._register(attachButtonStyler(addButton, this.themeService));
		append(addButton.element, vscodeIcon('AddFile'));
		append(addButton.element, $('span')).textContent = localize('addFile', 'Add file...');

		this._register(addButton.onDidClick(() => {
			// Note: this implies new item is always the last one. | or it will destroy next item | onUpdate => splice(end, 1, [newOne])
			this._input!.createNewSection();
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
		flashAllButton.element.innerHTML = renderOcticons('$(desktop-download) ' + localize('uploadAll', 'Upload all files'));

		this._register(flashAllButton.onDidClick(() => {
			return this.saveAndRun(ACTION_ID_FLASH_MANGER_FLASH_ALL);
		}));

		append(parent, $('div.spacer'));

		const baseAddressInput = this.baseAddressInput = this._register(new InputBox(parent, this.contextViewService, {}));
		baseAddressInput.element.title = 'Not editable, please wait next IDE update.';
		baseAddressInput.disable();
	}

	private async saveAndRun(commandId: string) {
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
			this.notificationService.error(err.message);
		});
	}

	private refreshTitle() {
		const errorMessage = this._input!.errorMessage;
		const data = this._input!.modelData;

		// console.log('update error message', errorMessage);
		if (errorMessage) {
			this.btnFlashAll.enabled = false;
			this.btnCreateZip.enabled = false;
			this.btnCreateZip2.enabled = false;
			this.error.textContent = errorMessage;
			this.information.textContent = '';
		} else {
			this.btnFlashAll.enabled = data.downloadSections.length > 0;
			this.btnCreateZip.enabled = data.downloadSections.length > 0;
			this.btnCreateZip2.enabled = data.downloadSections.length > 0;
			this.error.textContent = '';
			this.information.textContent = localize(
				'informationMessage',
				'{0} files, {1} data, write flash: {2} to {3}',
				data.downloadSections.length,
				humanSize(data.totalSize),
				data.baseAddress,
				data.endAddress,
			);
		}

		this.baseAddressInput.value = data.baseAddress;

		this.layout();
	}

	private refreshLine(ids: string[]) {
		ids.forEach((id) => {
			const changedIndex = this._input!.findSectionIndex(id);
			this.sectionList.splice(changedIndex, 1, this._input!.sliceData(changedIndex, 1));
		});
	}

	private refreshFullList() {
		this.sectionList.splice(0, this.sectionList.length, this._input!.sliceData());

		this.btnAddFile.enabled = true;
	}

	private onMoveItem(index1: number, index2: any) {
		if (index1 < 0 || index2 >= this._input!.modelData.downloadSections.length) {
			return; // just ignore out range
		}

		this._input!.swap(index1, index2);
		const newOrder = this._input!.sliceData(index1, 2);

		this.sectionList.splice(index1, 2, newOrder);
	}
}