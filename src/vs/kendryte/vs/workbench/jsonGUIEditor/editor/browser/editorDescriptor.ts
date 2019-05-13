import { IEditorDescriptor } from 'vs/workbench/browser/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditor } from 'vs/workbench/common/editor';
import { IJsonEditorToRegister } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { AbstractJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditor';

export class JsonEditorDescriptor<JsonType> implements IEditorDescriptor {
	constructor(
		private readonly ctor: IJsonEditorToRegister,
		private readonly descriptor: EditorId,
	) {
	}

	instantiate(instantiationService: IInstantiationService) {
		return instantiationService.createInstance(this.ctor, this.descriptor) as AbstractJsonEditor<IJsonEditorModel<JsonType>>;
	}

	getId(): string {
		return this.descriptor.id;
	}

	getName(): string {
		return this.descriptor.title;
	}

	describes(obj: unknown): boolean {
		return obj instanceof AbstractJsonEditor && (<IEditor>obj).getId() === this.descriptor.id;
	}
}