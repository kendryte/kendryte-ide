import { IEditor, IEditorInput } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';

export interface IJsonEditor extends IEditor {
	readonly descriptor: Readonly<EditorId>;
}

export interface IJsonEditorInput<JsonType> extends IEditorInput {
	readonly resource: URI;
	readonly model: IJsonEditorModel<JsonType>;
}

export interface EditorId {
	id: string;
	title: string;
}
