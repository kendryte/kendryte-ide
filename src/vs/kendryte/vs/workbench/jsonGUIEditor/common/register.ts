import { URI } from 'vs/base/common/uri';
import { Registry } from 'vs/platform/registry/common/platform';
import { normalizePosixPath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IConstructorSignature1, IConstructorSignature2 } from 'vs/platform/instantiation/common/instantiation';
import { EditorId, IJsonEditor, IJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { Extensions as EditorInputExtensions, IEditorInput, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { CommonJsonEditorInputFactory } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/inputFactory';
import { Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { JsonEditorDescriptor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/editorDescriptor';
import { createSyncDescriptor, SyncDescriptor, SyncDescriptor1 } from 'vs/platform/instantiation/common/descriptors';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { JsonEditorExtensions } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';

export interface IPathMatchingFunction {
	(resource: URI): boolean;
}

export type IJsonEditorToRegister = IConstructorSignature1<EditorId, IJsonEditor>;
export type IJsonEditorInputToRegister = IConstructorSignature2<EditorId, URI, IJsonEditorInput<any>>;

export interface ICustomJsonRegistry {
	registerCustomJson(id: string, pathMatch: string | RegExp | IPathMatchingFunction, schemaId: string): void;
	registerCustomEditor(id: string, title: string, editorCtor: IJsonEditorToRegister, inputCtor: IJsonEditorInputToRegister): void;

	getEditorInputById(id: string): SyncDescriptor1<URI, IEditorInput>;
	getSchemaById(id: string): IJSONSchema | undefined;
	matchPath(resource: URI): string | undefined;
	isResisted(id: string): boolean;
}

function createMatcher(pathMatch: string | RegExp | IPathMatchingFunction): IPathMatchingFunction {
	if (typeof pathMatch === 'string') {
		const pathEnd = normalizePosixPath('/' + pathMatch);
		return (resource: URI) => {
			return resource.fsPath.endsWith(pathEnd);
		};
	} else if (pathMatch instanceof RegExp) {
		return (resource: URI) => {
			return pathMatch.test(normalizePosixPath(resource.fsPath));
		};
	} else {
		return pathMatch;
	}
}

interface IRegistry {
	editorId: string;
	pathMatch: IPathMatchingFunction;
	schemaId: string;
}

class CustomJsonRegistryImpl implements ICustomJsonRegistry {
	private readonly customJsonList: IRegistry[] = [];
	private readonly editorInputMap = new Map<string, SyncDescriptor1<URI, IEditorInput>>();

	constructor() {
	}

	registerCustomJson(editorId: string, pathMatch: string | RegExp | IPathMatchingFunction, schemaId: string) {
		if (this.customJsonList.some(item => editorId === item.editorId)) {
			throw new Error('Duplicate custom json id: ' + editorId);
		}
		this.customJsonList.push({
			editorId,
			pathMatch: createMatcher(pathMatch),
			schemaId,
		});
	}

	registerCustomEditor(id: string, title: string, editorCtor: IJsonEditorToRegister, inputCtor: IJsonEditorInputToRegister) {
		const editorId: EditorId = { id, title };
		Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
			new JsonEditorDescriptor(editorCtor, editorId),
			new SyncDescriptor(inputCtor, [editorId]),
		);

		this.editorInputMap.set(id, createSyncDescriptor(inputCtor, editorId));

		Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
			.registerEditorInputFactory(id, CommonJsonEditorInputFactory);
	}

	getSchemaById(id: string) {
		for (const { editorId, schemaId } of this.customJsonList) {
			if (editorId === id) {
				if (schemaId) {
					return Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution)
						.getSchemaContributions()
						.schemas[schemaId];
				} else {
					return undefined;
				}
			}
		}
		throw new Error('Not registered editor: ' + id);
	}

	matchPath(path: URI) {
		for (const { editorId, pathMatch } of this.customJsonList) {
			if (pathMatch(path)) {
				return editorId;
			}
		}
		return undefined;
	}

	getEditorInputById(id: string) {
		if (!this.editorInputMap.has(id)) {
			throw new Error('Not registered editor: ' + id);
		}
		return this.editorInputMap.get(id)!;
	}

	isResisted(id: string) {
		return this.editorInputMap.has(id);
	}
}

export const CustomJsonRegistry: ICustomJsonRegistry = new CustomJsonRegistryImpl;
Registry.add(JsonEditorExtensions.CustomJson, CustomJsonRegistry);
