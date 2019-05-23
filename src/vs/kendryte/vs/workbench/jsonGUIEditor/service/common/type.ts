import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { DeepReadonly } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { URI } from 'vs/base/common/uri';
import { JSONPath } from 'vs/base/common/json';
import { Event } from 'vs/base/common/event';
import { IReference } from 'vs/base/common/lifecycle';
import { IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IJsonEditorModelConstructor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { StateChange } from 'vs/workbench/services/textfile/common/textfiles';

export const enum JsonChangeReason {
	Load = 'load',
	Set = 'set',
	ModelUpdate = 'update',
}

export interface IJsonEditorModel<JsonType> extends IEditorModel {
	readonly onContentChange: Event<JsonChangeReason>;
	readonly onDidChangeDirtyState: Event<boolean>;
	readonly onStateChange: Event<StateChange>;

	readonly data: DeepReadonly<JsonType>;
	readonly resource: URI;

	readonly reference: IReference<IResolvedTextEditorModel>;

	save(): Promise<void>;
	update(key: string | JSONPath, value: any): boolean;
	isDirty(): boolean;
	isLoaded():boolean;
	load(optional?: boolean): Promise<this>;
}

export interface ICustomJsonEditorService {
	_serviceBrand: any;

	createJsonModel<JsonType>(resource: URI): IJsonEditorModel<JsonType> | undefined;
	createJsonModel<JsonType, Model extends IJsonEditorModel<JsonType> = IJsonEditorModel<JsonType>>(resource: URI, ctor: IJsonEditorModelConstructor): Model | undefined;
	createTextReference(editorId: string, resource: URI, optional: boolean): Promise<IReference<IResolvedTextEditorModel>>;
	openEditorAs<T extends IEditorInput>(resource: URI, editorId: string): T;
	updateFocus(id: string, focus: boolean): void;
}

export const ICustomJsonEditorService = createDecorator<ICustomJsonEditorService>('customJsonEditorService');
