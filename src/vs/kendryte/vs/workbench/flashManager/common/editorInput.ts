import { ConfirmResult, EditorInput, IEditorInputFactory, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { KENDRYTE_FLASH_MANAGER_ID, KENDRYTE_FLASH_MANAGER_INPUT_ID, KENDRYTE_FLASH_MANAGER_TITLE } from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { localize } from 'vs/nls';
import { basename } from 'vs/base/common/path';
import { Emitter } from 'vs/base/common/event';
import { memoize } from 'vs/base/common/decorators';
import { IFlashManagerConfigJsonReadonly, IFlashSection } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';

export class FlashManagerEditorInput extends EditorInput {
	public static readonly ID: string = KENDRYTE_FLASH_MANAGER_INPUT_ID;

	private readonly model: FlashManagerEditorModel;
	private _errorMessage: string = '';
	private _dirty: boolean = false;

	private readonly _onReload = new Emitter<void>();
	public readonly onReload = this._onReload.event;

	private readonly _onItemUpdate = new Emitter<number[]>();
	public readonly onItemUpdate = this._onItemUpdate.event;

	private readonly _onItemDelete = new Emitter<number>();
	public readonly onItemDelete = this._onItemDelete.event;

	constructor(
		resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();

		this._register(this._onReload);
		this._register(this._onItemUpdate);
		this.model = instantiationService.createInstance(FlashManagerEditorModel, resource);
	}

	public get modelData(): IFlashManagerConfigJsonReadonly {
		return this.model.data;
	}

	public get errorMessage() {
		return this._errorMessage;
	}

	protected setDirty(dirty: boolean = true) {
		if (this._dirty === dirty) {
			return;
		}
		this._dirty = dirty;
		this._onDidChangeDirty.fire();
	}

	isDirty(): boolean {
		return this._dirty;
	}

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.SAVE);
	}

	save(): Promise<boolean> {
		return this.model.save().then(() => {
			this.setDirty(false);
			return true;
		}, () => {
			return false;
		});
	}

	async revert(options?: IRevertOptions): Promise<boolean> {
		return this.model.load().then((d) => {
			this.setDirty(false);
			this._onReload.fire();
			return true;
		});
	}

	getName(): string {
		return KENDRYTE_FLASH_MANAGER_TITLE;
	}

	getResource(): URI {
		return this.model.resource;
	}

	getTypeId(): string {
		return FlashManagerEditorInput.ID;
	}

	getPreferredEditorId(candidates: string[]): string {
		return KENDRYTE_FLASH_MANAGER_ID;
	}

	supportsSplitEditor(): boolean {
		return true;
	}

	matches(otherInput: FlashManagerEditorInput): boolean {
		if (this === otherInput) {
			return true;
		}
		try {
			return otherInput.getResource().toString() === this.getResource().toString();
		} catch (e) {
			return false;
		}
	}

	getTitle(verbosity: Verbosity = Verbosity.MEDIUM): string {
		switch (verbosity) {
			case Verbosity.SHORT:
				return 'Flash';
			case Verbosity.MEDIUM:
				return 'Flash manager';
			case Verbosity.LONG:
				return 'Flash upload configuration';
		}
	}

	getDescription(verbosity: Verbosity = Verbosity.MEDIUM): string {
		switch (verbosity) {
			case Verbosity.SHORT:
				return '';
			case Verbosity.MEDIUM:
				return localize('editing {0}', basename(this.getResource().fsPath));
			case Verbosity.LONG:
				return localize('editing {0}', this.getResource().fsPath);
		}

	}

	@memoize
	resolve(): Promise<FlashManagerEditorModel> {
		return this.revert().then(() => {
			return this.model;
		});
	}

	public createNewSection() {
		this.setDirty(true);
		const index = this.model.createNewSection();
		this._onItemUpdate.fire([index]);
	}

	public changeSectionFieldValue(index: number, field: keyof IFlashSection, value: string) {
		this.setDirty(true);
		this.model.setValue(index, field, value);
	}

	public deleteItem(index: number) {
		this.setDirty(true);
		this.model.removeValue(index);
		this._onItemDelete.fire(index);
	}
}

interface ISerializedFlashManagerEditorInput {
	resource: string;
}

export class FlashManagerEditorInputFactory implements IEditorInputFactory {
	constructor() { }

	public serialize(editorInput: FlashManagerEditorInput): string {
		const input = <FlashManagerEditorInput>editorInput;

		const serialized: ISerializedFlashManagerEditorInput = {
			resource: input.getResource().toString(),
		};

		return JSON.stringify(serialized);
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FlashManagerEditorInput {
		const deserialized: ISerializedFlashManagerEditorInput = JSON.parse(serializedEditorInput);

		return instantiationService.createInstance(
			FlashManagerEditorInput,
			URI.parse(deserialized.resource),
		);
	}
}

