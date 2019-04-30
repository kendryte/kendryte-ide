import { IEditorDescriptor } from 'vs/workbench/browser/editor';
import { IJsonEditorToRegister, JsonEditorBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorBaseImpl';
import { JsonEditorModelBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputModelImpl';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditor } from 'vs/workbench/common/editor';

export class JsonEditorDescriptor<JsonType> implements IEditorDescriptor {
	constructor(
		private readonly ctor: IJsonEditorToRegister<JsonEditorModelBase<JsonType>>,
		private readonly descriptor: EditorId,
	) {
	}

	instantiate(instantiationService: IInstantiationService): JsonEditorBase<JsonEditorModelBase<JsonType>> {
		return instantiationService.createInstance(this.ctor, this.descriptor);
	}

	getId(): string {
		return this.descriptor.id;
	}

	getName(): string {
		return this.descriptor.title;
	}

	describes(obj: unknown): boolean {
		return obj instanceof JsonEditorBase && (<IEditor>obj).getId() === this.descriptor.id;
	}
}