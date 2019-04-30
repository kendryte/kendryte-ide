import { IEditorInputFactory } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { JsonEditorInputBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';
import { JsonEditorHandlerContribution } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/replaceEditor';

export interface ISerializedJsonEditorInput {
	resource: string;
}

export class CommonJsonEditorInputFactory implements IEditorInputFactory {
	constructor() { }

	public serialize(editorInput: JsonEditorInputBase<any>): string {
		if (!editorInput || !editorInput.getResource()) {
			return '';
		}
		const serialized: ISerializedJsonEditorInput = {
			resource: editorInput.getResource()!.toString(),
		};

		return JSON.stringify(serialized);
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string) {
		const deserialized: ISerializedJsonEditorInput = JSON.parse(serializedEditorInput);
		return JsonEditorHandlerContribution.createJsonEditorInputByPath(URI.parse(deserialized.resource), instantiationService);
	}
}
