import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions } from 'vs/workbench/common/editor';
import { FpioaModel } from 'vs/kendryte/vs/workbench/fpioaConfig/common/fpioaModel';
import { URI } from 'vs/base/common/uri';
import { dispose } from 'vs/base/common/lifecycle';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Emitter, Event } from 'vs/base/common/event';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFpioaService, PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { SaveAllAction } from 'vs/workbench/contrib/files/browser/fileActions';

const fpioaInputTypeId = 'workbench.input.fpioaInput';

export class FpioaInputFactory implements IEditorInputFactory {
	static readonly ID = fpioaInputTypeId;

	public serialize(editorInput: EditorInput) {
		if (editorInput instanceof FpioaEditorInput) {
			const res = editorInput.getResource();
			if (res) {
				return res.fsPath;
			}
		}
		return;
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FpioaEditorInput {
		return instantiationService.createInstance(FpioaEditorInput, URI.file(serializedEditorInput));
	}
}

export class FpioaEditorInput extends EditorInput {
	public static readonly ID: string = fpioaInputTypeId;
	private _model: FpioaModel;

	private readonly _onDidChange = new Emitter<void>();
	readonly onDidChange: Event<void> = this._onDidChange.event;

	constructor(
		private resource: URI,
		// @ITextFileService private textFileService: ITextFileService,
		@ICommandService commandService: ICommandService,
		@IDialogService protected dialogService: IDialogService,
		@INotificationService private notifyService: INotificationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IFpioaService private readonly fpioaService: IFpioaService,
	) {
		super();

		const dis = commandService.onWillExecuteCommand(({ commandId }) => this.saveAllCommandHandler(commandId));
		this.onDispose(() => dispose(dis));

		lifecycleService.onWillShutdown((e) => {
			if (this.model && this.model.isDirty()) {
				e.join(this.model.save().then(() => void 0));
			}
		});
	}

	get model() {
		return this._model;
	}

	getTypeId(): string {
		return FpioaEditorInput.ID;
	}

	getName(): string {
		return localize('fpioaEditorInputName', 'fpioa Config');
	}

	getResource() {
		return this.resource;
	}

	supportsSplitEditor() {
		return false;
	}

	async resolve(): Promise<FpioaModel> {
		if (this._model) {
			dispose(this._model);
		}

		this._model = await this.fpioaService.createModel(this.resource);
		//	(this.textFileService.models as TextFileEditorModelManager).add(fileRes, this._model as any);

		return this._model;
	}

	unSelectChip() {
		const beforeNotDirty = this._model.isDirty();
		const changed = this._model.setChip(undefined);
		if (beforeNotDirty !== this._model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		if (changed) {
			this._onDidChange.fire();
		}
	}

	selectChip(name: string) {
		if (!getChipPackaging(name)) {
			throw new TypeError(`no such chip: ${name}`);
		}
		const beforeNotDirty = this._model.isDirty();

		const changed = this._model.setChip(name);

		if (beforeNotDirty !== this._model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		if (changed) {
			this._onDidChange.fire();
		}
	}

	private async _ask(oldTag: string, old: string, newTag: string, newLeft: string, newRight: string) {
		return await this.dialogService.confirm({
			title: localize('alert', 'Alert'),
			message: localize(
				'io.select.overwrite.alert',
				'Reassign {0} "{1}" from {2} "{3}" to {4} "{5}"?',
				oldTag, old,
				newTag, newLeft,
				newTag, newRight,
			),
			type: 'question',
			primaryButton: localize('yes', 'Yes'),
			secondaryButton: localize('cancel', 'Cancel'),
		}).then(({ confirmed }) => {
			return confirmed;
		}, () => {
			return false;
		});
	}

	// 当这个功能已经分配给了其他pin
	private async _overwritePin(funcId: string, newIoPin: string | undefined) {
		const alreadyAssigned = this._model.getFuncPin(funcId);
		if (!alreadyAssigned) {
			return;
		}

		const confirm = await this._ask(
			localize('function', 'function'), funcId,
			localize('pin', 'pin'), alreadyAssigned, newIoPin || 'Undefined',
		);
		if (confirm) {
			this._model.unsetFunc(funcId);
		}
	}

	private async _overwriteFunc(ioPin: string, funcId: string) {
		const alreadyAssigned = this._model.getPinFunc(ioPin);
		if (!alreadyAssigned) {
			return;
		}

		const confirm = await this._ask(
			localize('pin', 'pin'), ioPin,
			localize('function', 'function'), alreadyAssigned, funcId,
		);
		if (confirm) {
			this._model.unsetFunc(alreadyAssigned);
		}
	}

	async mapPinFunc({ func: funcId, pin: ioPin, triggerBy }: PinFuncSetEvent) {
		const changed = funcId !== this._model.getPinFunc(ioPin);

		if (!changed) {
			return;
		}
		const beforeDirty = this._model.isDirty();

		if (triggerBy === 'pin') { // 如果 设置某个pin为特定新功能
			if (funcId) {
				await this._overwritePin(funcId, ioPin);
			}
		} else if (triggerBy === 'func') { // 如果 设置某个功能到一个新pin
			if (ioPin) {
				await this._overwriteFunc(ioPin, funcId); // 当目标pin已经分配了其他功能
			}
		}

		this._model.setPinFunc(funcId, ioPin);

		if (beforeDirty !== this._model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		this._onDidChange.fire();
	}

	isDirty() {
		return this._model && this._model.isDirty();
	}

	dispose() {
		if (this._model) {
			dispose(this._model);
		}
		super.dispose();
	}

	matches(otherInput: any): boolean {
		return otherInput instanceof FpioaEditorInput;
	}

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.SAVE);
	}

	async save(): Promise<boolean> {
		if (!this._model) {
			return false;
		}
		const ok = await this._model.save();
		if (ok) {
			this._onDidChangeDirty.fire();
		}
		return ok;
	}

	revert(options?: IRevertOptions): Promise<boolean> {
		return Promise.resolve(false);
	}

	toString() {
		return '{fpioaEditorInput}';
	}

	private saveAllCommandHandler(commandId: string) {
		if (commandId === SaveAllAction.ID) {
			console.log('save when saveAll');
			this.save().then(undefined, err => this.notifyService.error(err));
		}
	}
}
