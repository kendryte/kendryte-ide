import { localize } from 'vs/nls';
import { FpioaModel } from 'vs/kendryte/vs/workbench/fpioaConfig/common/fpioaModel';
import { URI } from 'vs/base/common/uri';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { Emitter, Event } from 'vs/base/common/event';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFpioaInputState, PinFuncSetEvent } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { AbstractJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { ICustomJsonEditorService } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFPIOAMapData } from 'vs/kendryte/vs/base/common/jsonSchemas/deviceManagerSchema';

export class FpioaEditorInput extends AbstractJsonEditorInput<IFPIOAMapData, IFpioaInputState> {
	public readonly model: FpioaModel;
	private readonly _onDidChange = new Emitter<boolean>();
	readonly onDidChange: Event<boolean> = this._onDidChange.event;

	constructor(
		descriptor: EditorId,
		resource: URI,
		// @ITextFileService private textFileService: ITextFileService,
		@ICommandService commandService: ICommandService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICustomJsonEditorService customJsonEditorService: ICustomJsonEditorService,
		@IDialogService protected dialogService: IDialogService,
	) {
		super(descriptor, resource, instantiationService, customJsonEditorService);

		lifecycleService.onWillShutdown((e) => {
			if (this.model && this.model.isDirty()) {
				e.join(this.model.save().then(() => void 0));
			}
		});
	}

	createModel(customJsonEditorService: ICustomJsonEditorService) {
		return customJsonEditorService.createJsonModel<IFPIOAMapData>(this.resource, FpioaModel);
	}

	unSelectChip() {
		const beforeNotDirty = this.model.isDirty();
		const changed = this.model.setChip(undefined);
		if (beforeNotDirty !== this.model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		if (changed) {
			this._onDidChange.fire(true);
		}
	}

	selectChip(name: string) {
		if (!getChipPackaging(name)) {
			throw new TypeError(`no such chip: ${name}`);
		}
		const beforeNotDirty = this.model.isDirty();

		const changed = this.model.setChip(name);

		if (beforeNotDirty !== this.model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		if (changed) {
			this._onDidChange.fire(true);
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
		const alreadyAssigned = this.model.getFuncPin(funcId);
		if (!alreadyAssigned) {
			return;
		}

		const confirm = await this._ask(
			localize('function', 'function'), funcId,
			localize('pin', 'pin'), alreadyAssigned, newIoPin || 'Undefined',
		);
		if (confirm) {
			this.model.unsetFunc(funcId);
		}
	}

	private async _overwriteFunc(ioPin: string, funcId: string) {
		const alreadyAssigned = this.model.getPinFunc(ioPin);
		if (!alreadyAssigned) {
			return;
		}

		const confirm = await this._ask(
			localize('pin', 'pin'), ioPin,
			localize('function', 'function'), alreadyAssigned, funcId,
		);
		if (confirm) {
			this.model.unsetFunc(alreadyAssigned);
		}
	}

	async mapPinFunc({ func: funcId, pin: ioPin, triggerBy }: PinFuncSetEvent) {
		const changed = funcId !== this.model.getPinFunc(ioPin);

		if (!changed) {
			return;
		}
		const beforeDirty = this.model.isDirty();

		if (triggerBy === 'pin') { // 如果 设置某个pin为特定新功能
			if (funcId) {
				await this._overwritePin(funcId, ioPin);
			}
		} else if (triggerBy === 'func') { // 如果 设置某个功能到一个新pin
			if (ioPin) {
				await this._overwriteFunc(ioPin, funcId); // 当目标pin已经分配了其他功能
			}
		}

		this.model.setPinFunc(funcId, ioPin);

		if (beforeDirty !== this.model.isDirty()) {
			this._onDidChangeDirty.fire();
		}

		this._onDidChange.fire(false);
	}
}
