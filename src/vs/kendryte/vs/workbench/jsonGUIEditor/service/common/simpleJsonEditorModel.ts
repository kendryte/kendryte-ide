import { Emitter } from 'vs/base/common/event';
import { Disposable, IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { createSimpleJsonWarningMarkers } from 'vs/kendryte/vs/platform/marker/common/simple';
import { DeepReadonly } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { setProperty } from 'vs/base/common/jsonEdit';
import { Edit } from 'vs/base/common/jsonFormatter';
import { ITextModel } from 'vs/editor/common/model';
import { Range } from 'vs/editor/common/core/range';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Selection } from 'vs/editor/common/core/selection';
import { ITextFileEditorModel, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { JSONPath } from 'vs/base/common/json';
import { memoize } from 'vs/base/common/decorators';

export class SimpleJsonEditorModel<JsonType> extends Disposable implements IJsonEditorModel<JsonType> {
	private readonly _onDispose = this._register(new Emitter<void>());
	public readonly onDispose = this._onDispose.event;

	public reference: IReference<IResolvedTextEditorModel>;

	private readonly _onContentChange = this._register(new Emitter<JsonType>());
	public readonly onContentChange = this._onContentChange.event;

	private readonly _onDidChangeDirtyState = this._register(new Emitter<boolean>());
	public readonly onDidChangeDirtyState = this._onDidChangeDirtyState.event;

	protected jsonData?: JsonType;
	private _dirty: boolean = false;

	constructor(
		protected readonly editorId: string,
		public readonly resource: URI,
		@ICustomJsonEditorService protected readonly customJsonEditorService: ICustomJsonEditorService,
		@IMarkerService protected readonly markerService: IMarkerService,
		@ITextFileService private readonly textFileService: ITextFileService,
	) {
		super();

		this._register(textFileService.models.onModelSaved(({ resource }) => {
			if (this.resource.toString() === resource.toString()) {
				// console.log('json model saved by other');
				this.setDirty(false);
			}
		}));
	}

	get data(): DeepReadonly<JsonType> {
		if (!this.jsonData) {
			throw new Error('model not loaded');
		}
		return this.jsonData as any;
	}

	isDirty() {
		return this._dirty;
	}

	@memoize
	async load(): Promise<this> {
		this.reference = await this.customJsonEditorService.createTextReference(this.editorId, this.resource);
		debugger;

		this._register(this.reference);
		this._register(this.reference.object.onDispose(() => {
			this.dispose();
		}));
		this._register(this.reference.object.textEditorModel.onDidChangeContent(() => {
			this.refresh();
		}));
		this._register((this.reference.object as ITextFileEditorModel).onDidStateChange(() => {
			this.refresh();
		}));

		this.refresh();
		this.setDirty(false);
		return this;
	}

	private refresh() {
		// console.log('json refresh');
		const jsonText = this.reference.object.textEditorModel.getValue();

		const [json, warnings] = parseExtendedJson(jsonText);
		this.markerService.changeOne(this.editorId, this.resource, createSimpleJsonWarningMarkers(warnings));

		this.jsonData = json;

		this._onContentChange.fire(this.jsonData!);
	}

	update(key: string | JSONPath, value: any) {
		let someChange = false;
		const model = this.reference.object.textEditorModel;
		const { tabSize, insertSpaces } = model.getOptions();
		const eol = model.getEOL();

		if (value === null) {
			value = undefined;
		}
		const edits = setProperty(model.getValue(), Array.isArray(key) ? key : [key], value, { tabSize, insertSpaces, eol });
		for (const edit of edits) {
			const changed = this.applyEditToBuffer(edit, model);
			if (changed) {
				someChange = true;
			}
		}
		if (someChange) {
			this.setDirty(true);
		}

		return someChange;
	}

	private applyEditToBuffer(edit: Edit, model: ITextModel): boolean {
		const startPosition = model.getPositionAt(edit.offset);
		const endPosition = model.getPositionAt(edit.offset + edit.length);
		const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
		let currentText = model.getValueInRange(range);
		if (edit.content !== currentText) {
			const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
			model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
			return true;
		}
		return false;
	}

	public async save() {
		// console.log('json model save');
		await this.textFileService.save(this.resource);
		this.setDirty(false);
	}

	dispose() {
		this._onDispose.fire();
		this.markerService.changeOne(this.editorId, this.resource, []);
		super.dispose();
	}

	private setDirty(newState: boolean) {
		if (this._dirty === newState) {
			return;
		}

		this._dirty = newState;
		this._onDidChangeDirtyState.fire(this._dirty);
	}
}
