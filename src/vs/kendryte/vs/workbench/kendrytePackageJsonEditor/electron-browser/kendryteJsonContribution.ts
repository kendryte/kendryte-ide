import { Registry } from 'vs/platform/registry/common/platform';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { KendrytePackageJsonEditor } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditor';
import { KendrytePackageJsonEditorInput, KendrytePackageJsonEditorInputFactory } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { KENDRYTE_PACKAGE_JSON_EDITOR_TITLE } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/kendrytePackageJsonEditorService';
import { KendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/browser/kendrytePackageJsonEditorService';
import { KendrytePackageJsonEditorHandlerContribution } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/registerEditorHandler';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(KendrytePackageJsonEditorHandlerContribution, LifecyclePhase.Starting);

Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
	new EditorDescriptor(
		KendrytePackageJsonEditor,
		KendrytePackageJsonEditor.ID,
		KENDRYTE_PACKAGE_JSON_EDITOR_TITLE,
	),
	[
		new SyncDescriptor(KendrytePackageJsonEditorInput),
	],
);
Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
	.registerEditorInputFactory(KendrytePackageJsonEditor.ID, KendrytePackageJsonEditorInputFactory);

registerSingleton(IKendrytePackageJsonEditorService, KendrytePackageJsonEditorService);
