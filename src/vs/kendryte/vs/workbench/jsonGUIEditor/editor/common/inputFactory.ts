import { IEditorInputFactory } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { AbstractJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { Registry } from 'vs/platform/registry/common/platform';
import { JsonEditorExtensions } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { ICustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';

export interface ISerializedJsonEditorInput {
	resource: string;
}

export class CommonJsonEditorInputFactory implements IEditorInputFactory {
	private registry: ICustomJsonRegistry;

	constructor() {
		this.registry = Registry.as<ICustomJsonRegistry>(JsonEditorExtensions.CustomJson);
	}

	public serialize(editorInput: AbstractJsonEditorInput<any>): string {
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
		const resource = URI.parse(deserialized.resource);
		const id = this.registry.matchPath(resource);
		if (!id) {
			debugger;
			return;
		}
		const input = this.registry.getEditorInputById(id);
		return instantiationService.createInstance(input, resource) as AbstractJsonEditorInput<any>;
	}
}
