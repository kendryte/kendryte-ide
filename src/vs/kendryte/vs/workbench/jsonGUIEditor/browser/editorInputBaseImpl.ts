import { ConfirmResult, EditorInput, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { EditorId, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { IConstructorSignature1, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { JsonEditorModelBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputModelImpl';

export const editorBrandSymbol = Symbol('EditorId');

export interface IJsonEditorInputConstructor<JsonType = any>
	extends IConstructorSignature1<URI, JsonEditorInputBase<JsonEditorModelBase<JsonType>>> {
}

export interface ISwitchTypeEvent {
	type: 'json' | 'gui';
	data: any;
	dirty: boolean;
}

export abstract class JsonEditorInputBase<Model extends IJsonEditorModel<any>> extends EditorInput {
	public readonly model: Model;
	private _dirty: boolean = false;
	private readonly _editorId: EditorId;

	private readonly _onRefresh = this._register(new Emitter<void>());
	public readonly onRefresh = this._onRefresh.event;

	private readonly _onSwitchType = this._register(new Emitter<ISwitchTypeEvent>());
	public readonly onSwitchType = this._onSwitchType.event;

	public constructor(
		protected readonly resource: URI,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		this._editorId = this.constructor[editorBrandSymbol];
		this.model = this._register(this.createModel(instantiationService));
	}

	protected abstract createModel(instantiationService: IInstantiationService): Model;

	getResource(): URI {
		return this.resource;
	}

	getPreferredEditorId(candidates: string[]): string {
		return this._editorId.id;
	}

	confirmSave(): Promise<ConfirmResult> {
		return Promise.resolve(ConfirmResult.SAVE);
	}

	save(): Promise<boolean> {
		return this.model.save().then(() => {
			this.setDirty(false);
			return true;
		}, (e) => {
			console.error('Failed to save: ', e);
			return false;
		});
	}

	async switchTo(type: 'json' | 'gui') {
		this._onSwitchType.fire({
			type,
			data: this.model.data,
			dirty: this.isDirty(),
		});
	}

	async revert(options?: IRevertOptions): Promise<boolean> {
		return this.model.revert().then((reverted: boolean) => {
			if (reverted) {
				this.setDirty(false);
			}
			this._onRefresh.fire();
			return reverted;
		});
	}

	isDirty(): boolean {
		return this._dirty;
	}

	protected setDirty(dirty: boolean = true) {
		if (this._dirty === dirty) {
			return;
		}
		this._dirty = dirty;
		this._onDidChangeDirty.fire();
	}

	getTitle(verbosity?: Verbosity): string {
		return this._editorId.title; // should be override
	}

	getName(): string {
		return this._editorId.title;
	}

	getTypeId(): string {
		return this._editorId.id;
	}

	async resolve() {
		await this.model.load();
		this._onRefresh.fire();
		return this.model;
	}
}
