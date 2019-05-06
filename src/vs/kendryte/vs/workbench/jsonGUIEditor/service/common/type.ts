import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { DeepReadonly } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { URI } from 'vs/base/common/uri';
import { JSONPath } from 'vs/base/common/json';
import { Event } from 'vs/base/common/event';
import { IReference } from 'vs/base/common/lifecycle';
import { IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { IEditorInput } from 'vs/workbench/common/editor';

export interface IJsonEditorModel<JsonType> extends IEditorModel {
	readonly onContentChange: Event<JsonType>;
	readonly onDidChangeDirtyState: Event<boolean>;

	readonly data: DeepReadonly<JsonType>;
	readonly resource: URI;

	save(): Promise<void>;
	update(key: string | JSONPath, value: any): boolean;
	isDirty(): boolean;
}

export interface ICustomJsonEditorService {
	_serviceBrand: any;

	createJsonModel<JsonType>(resource: URI): IJsonEditorModel<JsonType> | undefined;
	createTextReference(editorId: string, resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
	openEditorAs(resource: URI, editorId: string): IEditorInput;
	updateFocus(id: string, focus: boolean): void;
}

export const ICustomJsonEditorService = createDecorator<ICustomJsonEditorService>('customJsonEditorService');
