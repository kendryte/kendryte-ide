import { TPromise } from 'vs/base/common/winjs.base';
import * as nls from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ConfirmResult, EditorInput, IEditorInputFactory } from 'vs/workbench/common/editor';
import { FpgioModel } from 'vs/workbench/parts/maix/fpgio-config/browser/fpgioModel';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import URI from 'vs/base/common/uri';
import { dispose } from 'vs/base/common/lifecycle';
import { IRevertOptions } from 'vs/platform/editor/common/editor';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpgio-config/common/packagingRegistry';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { TextFileEditorModelManager } from 'vs/workbench/services/textfile/common/textFileEditorModelManager';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { SaveAllAction } from 'vs/workbench/parts/files/electron-browser/fileActions';

const fpgioInputTypeId = 'workbench.input.fpgioInput';

export class FpgioInputFactory implements IEditorInputFactory {
	static readonly ID = fpgioInputTypeId;

	public serialize(editorInput: EditorInput): string {
		if (editorInput instanceof FpgioEditorInput) {
			return editorInput.serialize();
		} else {
			return '{}';
		}
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FpgioEditorInput {
		return instantiationService.createInstance(FpgioEditorInput, serializedEditorInput);
	}
}

export class FpgioEditorInput extends EditorInput {
	public static readonly ID: string = fpgioInputTypeId;
	private model: FpgioModel;

	constructor(
		protected readonly data: string = '',
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ITextFileService private textFileService: ITextFileService,
		@ICommandService commandService: ICommandService,
		@INotificationService private notifyService: INotificationService,
	) {
		super();

		const dis = commandService.onWillExecuteCommand(({ commandId }) => this.saveAllCommandHandler(commandId));
		this.onDispose(() => dispose(dis));
	}

	getTypeId(): string {
		return FpgioEditorInput.ID;
	}

	getName(): string {
		return nls.localize('fpgioEditorInputName', 'FPGIO Config');
	}

	getResource(): URI {
		return this.workspaceContextService.getWorkspace().folders[0].toResource('config/fpgio.json5');
	}

	supportsSplitEditor() {
		return false;
	}

	async resolve(refresh?: boolean): TPromise<FpgioModel> {
		const fileRes = this.getResource();
		if (!refresh) {
			if (this.model && this.model.resource.fsPath === fileRes.fsPath) {
				return this.model;
			}
		}
		if (this.model) {
			dispose(this.model);
		}

		this.model = this.instantiationService.createInstance(FpgioModel, fileRes);

		(this.textFileService.models as TextFileEditorModelManager).add(fileRes, this.model as any);

		return await this.model.load();
	}

	selectChip(name: string) {
		if (!getChipPackaging(name)) {
			throw new TypeError(`no such chip: ${name}`);
		}
		this.model.setChip(name);
		this._onDidChangeDirty.fire();
	}

	mapPinFunc(funcId: string, ioPin: string) {
		this.model.setPinFunc(funcId, ioPin);
		this._onDidChangeDirty.fire();
	}

	isDirty() {
		return this.model && this.model.isDirty();
	}

	dispose() {
		if (this.model) {
			dispose(this.model);
		}
		super.dispose();
	}

	matches(otherInput: any): boolean {
		return otherInput instanceof FpgioEditorInput;
	}

	confirmSave(): TPromise<ConfirmResult> {
		return TPromise.wrap(ConfirmResult.SAVE);
	}

	async save(): TPromise<boolean> {
		if (!this.model) {
			return false;
		}
		const ok = await this.model.save();
		if (ok) {
			this._onDidChangeDirty.fire();
		}
		return ok;
	}

	revert(options?: IRevertOptions): TPromise<boolean> {
		return TPromise.as(false);
	}

	toString() {
		return '{FpgioEditorInput}';
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
