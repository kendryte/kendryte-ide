import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions } from 'vs/workbench/common/editor';
import { FpioaModel } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaModel';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { URI } from 'vs/base/common/uri';
import { dispose } from 'vs/base/common/lifecycle';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { SaveAllAction } from 'vs/workbench/parts/files/electron-browser/fileActions';
import { Emitter, Event } from 'vs/base/common/event';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';

const fpioaInputTypeId = 'workbench.input.fpioaInput';

export class FpioaInputFactory implements IEditorInputFactory {
	static readonly ID = fpioaInputTypeId;

	public serialize(editorInput: EditorInput): string {
		if (editorInput instanceof FpioaEditorInput) {
			return editorInput.serialize();
		} else {
			return '{}';
		}
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FpioaEditorInput {
		return instantiationService.createInstance(FpioaEditorInput, serializedEditorInput);
	}
}

export class FpioaEditorInput extends EditorInput {
	public static readonly ID: string = fpioaInputTypeId;
	private _model: FpioaModel;

	private readonly _onDidChange = new Emitter<void>();
	readonly onDidChange: Event<void> = this._onDidChange.event;

	constructor(
		protected readonly data: string = '',
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@IInstantiationService private instantiationService: IInstantiationService,
		// @ITextFileService private textFileService: ITextFileService,
		@ICommandService commandService: ICommandService,
		@IDialogService protected dialogService: IDialogService,
		@INotificationService private notifyService: INotificationService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		super();

		const dis = commandService.onWillExecuteCommand(({ commandId }) => this.saveAllCommandHandler(commandId));
		this.onDispose(() => dispose(dis));

		lifecycleService.onWillShutdown((e) => {
			if (this.model && this.model.isDirty()) {
				e.veto(this.model.save().then(() => false));
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

	getResource(): URI {
		return this.workspaceContextService.getWorkspace().folders[0].toResource('config/fpioa.cfg');
	}

	supportsSplitEditor() {
		return false;
	}

	async resolve(refresh?: boolean): TPromise<FpioaModel> {
		const fileRes = this.getResource();
		if (!refresh) {
			if (this._model && this._model.getResource().fsPath === fileRes.fsPath) {
				return this._model;
			}
		}
		if (this._model) {
			dispose(this._model);
		}

		this._model = this.instantiationService.createInstance(FpioaModel, fileRes);

		//	(this.textFileService.models as TextFileEditorModelManager).add(fileRes, this._model as any);

		return await this._model.load();
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

	private async _ask(oldTag, old, newTag, newLeft, newRight) {
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
	private async _overwritePin(funcId: string, newIoPin: string) {
		const alreadyAssigned = this._model.getFuncPin(funcId);
		if (!alreadyAssigned) {
			return;
		}

		const confirm = await this._ask(
			localize('function', 'function'), funcId,
			localize('pin', 'pin'), alreadyAssigned, newIoPin,
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

	confirmSave(): TPromise<ConfirmResult> {
		return TPromise.wrap(ConfirmResult.SAVE);
	}

	async save(): TPromise<boolean> {
		if (!this._model) {
			return false;
		}
		const ok = await this._model.save();
		if (ok) {
			this._onDidChangeDirty.fire();
		}
		return ok;
	}

	revert(options?: IRevertOptions): TPromise<boolean> {
		return TPromise.as(false);
	}

	toString() {
		return '{fpioaEditorInput}';
	}

	serialize() {
		return '{}';
	}

	private saveAllCommandHandler(commandId: string) {
		if (commandId === SaveAllAction.ID) {
			console.log('save when saveAll');
			this.save().then(undefined, err => this.notifyService.error(err));
		}
	}
}
