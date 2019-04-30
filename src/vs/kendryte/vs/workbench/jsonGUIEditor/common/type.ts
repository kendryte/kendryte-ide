import { IEditorModel } from 'vs/platform/editor/common/editor';

export interface ResolveAs<T extends IEditorModel> {
	resolve(): Promise<T>;
}

export interface IJsonEditorModel<JsonType> extends IEditorModel {
	readonly data: JsonType;
	save(): Promise<void>;
	revert(): Promise<boolean>;
}

export interface EditorId {
	id: string;
	title: string;
}
