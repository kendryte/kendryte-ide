import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { $, append } from 'vs/base/browser/dom';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { IMessage, InputBox, MessageType } from 'vs/base/browser/ui/inputbox/inputBox';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { PublicDisposable } from 'vs/kendryte/vs/base/common/lifecycle/PublicDisposable';
import { localize } from 'vs/nls';
import { attachButtonStyler, attachInputBoxStyler } from 'vs/platform/theme/common/styler';
import { Action } from 'vs/base/common/actions';
import { vscodeIconClass, vsiconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { Emitter } from 'vs/base/common/event';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { URI } from 'vs/base/common/uri';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Button } from 'vs/base/browser/ui/button/button';
import { isValidFlashAddressString, parseMemoryAddress, validMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { IFlashSectionUI } from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { LazyInputBox } from 'vs/kendryte/vs/base/browser/ui/lazyInputBox';
import { FLASH_SAFE_ADDRESS } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';

const TEMPLATE_ID = 'template.flash.manager.list.section';

const validName = /^[a-zA-Z][a-zA-Z0-9_]+$/;
const invalidName: IMessage = {
	content: localize('invalidName', 'Invalid name, must match: {0}', '' + validName),
	type: MessageType.ERROR,
};

const invalidAddress: IMessage = {
	content: localize('invalidAddress', 'Invalid address, must match: {0}', '' + validMemoryAddress),
	type: MessageType.ERROR,
};
const invalidAddressAlign: IMessage = {
	content: localize('invalidAddressAlign', 'Flash address must be divisible by {0}', 8),
	type: MessageType.ERROR,
};
const warnApplicationAddress: IMessage = {
	content: localize('noteAddressProgram', 'Note: remember to verify your program binary size'),
	type: MessageType.WARNING,
};

const emptyFile: IMessage = {
	content: localize('filenameEmpty', 'File is required'),
	type: MessageType.ERROR,
};

interface ITemplateData {
	elementDispose: IDisposable[];
	readonly toDispose: IDisposable;
	readonly nameInput: InputBox;
	readonly addressInput: InputBox;
	readonly addressEndDisplay: InputBox
	readonly fileInput: InputBox;
	readonly removeButton: Button;
	readonly moveUpButton: Button;
	readonly moveDownButton: Button;
}

export class FlashSectionDelegate implements IListVirtualDelegate<IFlashSectionUI> {
	public getHeight(element: IFlashSectionUI): number {
		return 110;
	}

	public getTemplateId(element: IFlashSectionUI): string {
		return TEMPLATE_ID;
	}
}

export class FlashSectionRender implements IPagedRenderer<IFlashSectionUI, ITemplateData> {
	public readonly templateId: string = TEMPLATE_ID;
	private readonly rootPath: string;

	private readonly _onFieldChange = new Emitter<{ id: string; field: keyof IFlashSection; value: string }>();
	public readonly onFieldChange = this._onFieldChange.event;

	private readonly _onDeleteClick = new Emitter<string>();
	public readonly onDeleteClick = this._onDeleteClick.event;

	private readonly _onMove = new Emitter<{ id: string; toDown: boolean; }>(); // moveDown = true
	public readonly onMove = this._onMove.event;

	constructor(
		@INodePathService nodePathService: INodePathService,
		@IThemeService private readonly themeService: IThemeService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		this.rootPath = nodePathService.workspaceFilePath();
	}

	public renderElement(element: IFlashSectionUI, index: number, templateData: ITemplateData, dynamicHeightProbing?: boolean): void {
		// console.log('render item ', index);
		templateData.elementDispose = dispose(templateData.elementDispose);

		templateData.nameInput.value = element.name;
		if (element.autoAddress) {
			templateData.addressInput.value = '';
			templateData.addressInput.setPlaceHolder('Auto: ' + element.address);
		} else {
			templateData.addressInput.value = element.address;
			templateData.addressInput.setPlaceHolder('');
		}
		templateData.addressEndDisplay.value = `${element.addressEnd} (${element.filesize} bytes)`;

		templateData.fileInput.value = element.filename;

		templateData.elementDispose.push(templateData.nameInput.onDidChange((text) => {
			this._onFieldChange.fire({ id: element.id, field: 'name', value: text });
		}));
		templateData.elementDispose.push(templateData.addressInput.onDidChange((text) => {
			this._onFieldChange.fire({ id: element.id, field: 'address', value: text });
		}));
		templateData.elementDispose.push(templateData.fileInput.onDidChange((text) => {
			this._onFieldChange.fire({ id: element.id, field: 'filename', value: text });
		}));
		templateData.elementDispose.push(templateData.removeButton.onDidClick(() => {
			this._onDeleteClick.fire(element.id);
		}));
		templateData.elementDispose.push(templateData.moveUpButton.onDidClick(() => {
			this._onMove.fire({ id: element.id, toDown: false });
		}));
		templateData.elementDispose.push(templateData.moveDownButton.onDidClick(() => {
			this._onMove.fire({ id: element.id, toDown: true });
		}));
	}

	public disposeElement(element: IFlashSectionUI, index: number, templateData: ITemplateData, dynamicHeightProbing?: boolean): void {
		templateData.elementDispose = dispose(templateData.elementDispose);
	}

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		const dis = new PublicDisposable();
		const parent = append(container, $('div.flash-section'));

		const l1 = append(parent, $('div.l1'));
		const nameInput = this.createNameBox(l1, dis);
		const addressInput = this.createAddressBox(l1, dis);
		const addressEndDisplay = this.createAddressEnd(l1, dis);

		const ctl = append(l1, $('div.ctl'));
		const moveUpButton = this.createMoveButton('up', ctl, dis);
		const moveDownButton = this.createMoveButton('down', ctl, dis);
		const removeButton = this.createRemoveButton(ctl, dis);

		const l2 = append(parent, $('div.l2'));
		const fileInput = this.createFileBox(l2, dis);

		return {
			toDispose: dis,
			nameInput,
			addressInput,
			addressEndDisplay,
			fileInput,
			removeButton,
			moveUpButton,
			moveDownButton,
			elementDispose: [],
		};
	}

	public disposeTemplate(templateData: ITemplateData): void {
		templateData.toDispose.dispose();
	}

	private createNameBox(parent: HTMLElement, _disposable: PublicDisposable) {
		const nameInputLabel = append(parent, $('label.name'));
		nameInputLabel.textContent = localize('nameLabel', 'Section name: ');

		const nameInput = _disposable.register(new LazyInputBox(nameInputLabel, this.contextViewService, {
			placeholder: localize('namePlaceholder', 'Reference name'),
			validationOptions: {
				validation(val: string) {
					if (validName.test(val)) {
						return null;
					}
					return invalidName;
				},
			},
		}));
		_disposable.register(attachInputBoxStyler(nameInput, this.themeService));

		return nameInput;
	}

	private createAddressBox(parent: HTMLElement, _disposable: PublicDisposable) {
		const addressInputLabel = append(parent, $('label.address'));
		addressInputLabel.textContent = localize('addressLabel', 'Flash address: ');

		const addressInput = _disposable.register(new LazyInputBox(addressInputLabel, this.contextViewService, {
			placeholder: localize('addressPlaceholder', 'Flash address'),
			validationOptions: {
				validation(val: string) {
					if (!val) { // auto address
						return null;
					}
					if (!isValidFlashAddressString(val)) {
						return invalidAddress;
					}
					const loc = parseMemoryAddress(val);
					if (loc % 8) {
						return invalidAddressAlign;
					}
					if (loc < FLASH_SAFE_ADDRESS) {
						return warnApplicationAddress;
					}
					return null;
				},
			},
			actions: [
				new Action('auto', localize('auto', 'Auto determine'), vsiconClass('clear-window'), true, async () => {
					addressInput.value = '';
				}),
			],
		}));
		_disposable.register(attachInputBoxStyler(addressInput, this.themeService));

		return addressInput;
	}

	private createAddressEnd(parent: HTMLElement, _disposable: PublicDisposable) {
		const label = append(parent, $('label.address'));
		label.textContent = localize('addressEndLabel', 'End: ');

		const input = _disposable.register(new InputBox(label, undefined));
		input.disable();
		input.inputElement.readOnly = true;

		_disposable.register(attachInputBoxStyler(input, this.themeService));

		return input;
	}

	private createFileBox(parent: HTMLElement, _disposable: PublicDisposable) {
		const label = append(parent, $('label.file'));
		label.textContent = localize('fileLabel', 'File path:');

		const input: InputBox = _disposable.register(new LazyInputBox(label, this.contextViewService, {
			placeholder: localize('addressPlaceholder', 'Flash address'),
			validationOptions: {
				validation(val: string) {
					return val ? null : emptyFile;
				},
			},
			actions: [
				new Action('open', localize('open', 'Open file...'), vscodeIconClass('AddFile'), true, () => {
					return this.tryOpenFile(input);
				}),
			],
		}));
		_disposable.register(attachInputBoxStyler(input, this.themeService));

		return input;
	}

	private async tryOpenFile(input: InputBox) {
		const sel = await this.fileDialogService.showOpenDialog({
			title: localize('selectTitle', 'Select file to flash'),
			defaultUri: URI.file(this.rootPath),
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: false,
		});
		if (!sel || sel.length === 0) {
			return;
		}

		const path = resolvePath(sel[0].fsPath);
		if (!path) {
			return;
		}

		if (!path.startsWith(this.rootPath)) {
			this.notificationService.error(localize('errorOutside', 'Must select files inside project root.'));
			return;
		}

		input.value = path.replace(this.rootPath, '').replace(/^\/+/, '');
	}

	private createRemoveButton(parent: HTMLElement, _disposable: PublicDisposable) {
		const button = _disposable.register(new Button(parent, {}));
		_disposable.register(attachButtonStyler(button, this.themeService));
		button.element.classList.add('remove');
		append(button.element, $('span.octicon.octicon-x'));
		return button;
	}

	private createMoveButton(action: string, parent: HTMLElement, _disposable: PublicDisposable) {
		const button = _disposable.register(new Button(parent, {}));
		_disposable.register(attachButtonStyler(button, this.themeService));
		button.element.classList.add('move');
		button.element.classList.add(action);
		append(button.element, $('span.octicon.octicon-chevron-' + action));
		return button;
	}
}

