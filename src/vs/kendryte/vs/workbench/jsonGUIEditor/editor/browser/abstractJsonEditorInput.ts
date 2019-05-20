import { ConfirmResult, EditorInput, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { EditorId, IJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { IEditorModel } from 'vs/platform/editor/common/editor';

export abstract class AbstractJsonEditorInput<JsonType> extends EditorInput implements IJsonEditorInput<JsonType> {
	public readonly model: IJsonEditorModel<JsonType>;

	private readonly _onSwitchType = this._register(new Emitter<void>());
	public readonly onSwitchType = this._onSwitchType.event;
	private _jsonMode: boolean = false;

	public constructor(
		private readonly descriptor: EditorId,
		public readonly resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICustomJsonEditorService customJsonEditorService: ICustomJsonEditorService,
	) {
		super();
		const model = this.createModel(customJsonEditorService);
		if (!model) {
			throw new Error('Cannot find json model for file: ' + resource.toString());
		}
		this.model = model;
		let oneDispose = false;
		this._register(this.model.onDispose(() => {
			if (oneDispose) {
				return;
			}
			oneDispose = true;
			this.dispose();
		}));
		this._register(this.onDispose(() => {
			if (oneDispose) {
				return;
			}
			oneDispose = true;
			model.dispose();
		}));
		this._register(this.model.onDidChangeDirtyState(() => {
			this._onDidChangeDirty.fire();
		}));
	}

	protected abstract createModel(
		customJsonEditorService: ICustomJsonEditorService,
	): IJsonEditorModel<JsonType> | undefined;

	getResource(): URI {
		return this.resource;
	}

	getPreferredEditorId(candidates: string[]): string {
		return this.descriptor.id;
	}

	supportsSplitEditor(): boolean {
		return false;
	}

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.SAVE);
	}

	save(): Promise<boolean> {
		return this.model.save().then(() => {
			return true;
		}, (e) => {
			console.error('Failed to save: ', e);
			return false;
		});
	}

	async switchTo(type: 'json' | 'gui') {
		const jsonMode = type === 'json';
		if (this._jsonMode === jsonMode) {
			return;
		}
		this._jsonMode = jsonMode;
		this._onSwitchType.fire();
	}

	get jsonMode() {
		return this._jsonMode;
	}

	async revert(options?: IRevertOptions): Promise<boolean> {
		return Promise.resolve(false);
	}

	isDirty(): boolean {
		return this.model.isDirty();
	}

	getTitle(verbosity?: Verbosity): string {
		return this.descriptor.title; // should be override
	}

	getName(): string {
		return this.descriptor.title;
	}

	getTypeId(): string {
		return this.descriptor.id;
	}

	async resolve(): Promise<IEditorModel>;
	async resolve(toRaw: false): Promise<IJsonEditorModel<JsonType>>;
	async resolve(toRaw: boolean = true) {
		await this.model.load();
		if (toRaw) {
			return this.model.reference.object;
		}
		return this.model;
	}

	matches(otherInput: AbstractJsonEditorInput<any>): boolean {
		if (this === otherInput) {
			return true;
		}
		try {
			return otherInput.getTypeId() === this.getTypeId() &&
			       otherInput.getResource().toString() === this.getResource().toString();
		} catch (e) {
			return false;
		}
	}
}
