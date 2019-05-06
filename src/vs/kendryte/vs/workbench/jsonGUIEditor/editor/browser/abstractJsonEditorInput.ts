import { ConfirmResult, EditorInput, IRevertOptions, Verbosity } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Emitter } from 'vs/base/common/event';
import { EditorId, IJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';

export interface ISwitchTypeEvent {
	type: 'json' | 'gui';
	data: any;
	dirty: boolean;
}

export abstract class AbstractJsonEditorInput<JsonType> extends EditorInput implements IJsonEditorInput<JsonType> {
	public readonly model: IJsonEditorModel<JsonType>;

	private readonly _onRefresh = this._register(new Emitter<void>());
	public readonly onRefresh = this._onRefresh.event;

	private readonly _onSwitchType = this._register(new Emitter<ISwitchTypeEvent>());
	public readonly onSwitchType = this._onSwitchType.event;

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
		this._register(this.model.onDispose(() => {
			this.dispose();
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
		this._onSwitchType.fire({
			type,
			data: this.model.data,
			dirty: this.isDirty(),
		});
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

	async resolve() {
		await this.model.load();
		this._onRefresh.fire();
		return this.model;
	}
}
