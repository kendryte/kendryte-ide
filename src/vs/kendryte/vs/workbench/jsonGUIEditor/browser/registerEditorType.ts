import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { CommonJsonEditorInputFactory } from 'vs/kendryte/vs/workbench/jsonGUIEditor/electron-browser/inputFactory';
import { normalizePosixPath } from 'vs/kendryte/vs/base/common/resolvePath';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IJsonEditorToRegister } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorBaseImpl';
import { JsonEditorHandlerContribution } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/replaceEditor';
import { editorBrandSymbol, IJsonEditorInputConstructor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { JsonEditorModelBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputModelImpl';
import { JsonEditorDescriptor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorDescriptor';

export interface IPathMatchingFunction {
	(resource: URI): boolean;
}

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(JsonEditorHandlerContribution, LifecyclePhase.Starting);

export function registerJsonEditor<JsonType, Model extends JsonEditorModelBase<JsonType>>(
	descriptor: EditorId,
	pathMatch: string | RegExp | IPathMatchingFunction,
	Editor: IJsonEditorToRegister<Model>,
	Input: IJsonEditorInputConstructor<JsonType>,
) {
	Input[editorBrandSymbol] = descriptor;
	Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
		new JsonEditorDescriptor(
			Editor,
			descriptor,
		),
		new SyncDescriptor(Input),
	);
	Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
		.registerEditorInputFactory(descriptor.id, CommonJsonEditorInputFactory);

	JsonEditorHandlerContribution.inputMatchList.push([createMatcher(pathMatch), Input]);
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