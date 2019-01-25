import 'vs/css!vs/kendryte/vs/workbench/packageManager/browser/media/package-manager';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ViewletExtensions, ViewletDescriptor, ViewletRegistry } from 'vs/workbench/browser/viewlet';
import { IPackageRegistryService, PACKAGE_MANAGER_TITLE, PACKAGE_MANAGER_VIEWLET_ID as VIEWLET_ID } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { PackageManagerViewletViewsContribution } from 'vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/register';
import { PackageManagerViewlet } from 'vs/kendryte/vs/workbench/packageManager/browser/packageManagerViewlet';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { localize } from 'vs/nls';
import { PackageDetailEditor } from 'vs/kendryte/vs/workbench/packageManager/browser/editors/packageDetail';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { PackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/electron-browser/packageRegistryService';
import { PackageBrowserEditor } from 'vs/kendryte/vs/workbench/packageManager/browser/editors/packageBrowser';
import { PackageBrowserInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageBrowserInput';
import { EditorInput, Extensions as EditorInputExtensions, IEditorInputFactory, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PackageDetailCompletionInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageDetailInput';

Registry.as<ViewletRegistry>(ViewletExtensions.Viewlets).registerViewlet(new ViewletDescriptor(
	PackageManagerViewlet,
	VIEWLET_ID,
	localize('packageManager', 'Package Manager'),
	'packageManager',
	100,
));

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(PackageManagerViewletViewsContribution, LifecyclePhase.Ready);

const detailDescriptor = new EditorDescriptor(
	PackageDetailEditor,
	PackageDetailEditor.ID,
	localize('package', 'Package'),
);

Registry.as<IEditorRegistry>(EditorExtensions.Editors)
	.registerEditor(detailDescriptor, [new SyncDescriptor(PackageDetailCompletionInput)]);

const browserDescriptor = new EditorDescriptor(
	PackageBrowserEditor,
	PackageBrowserEditor.ID,
	PACKAGE_MANAGER_TITLE,
);

Registry.as<IEditorRegistry>(EditorExtensions.Editors)
	.registerEditor(browserDescriptor, [new SyncDescriptor(PackageBrowserInput)]);

class PackageBrowserInputInputFactory implements IEditorInputFactory {
	serialize(editorInput: EditorInput): string {
		return '';
	}

	deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput {
		return new PackageBrowserInput(serializedEditorInput);
	}
}

Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories).registerEditorInputFactory(PackageBrowserInput.ID, PackageBrowserInputInputFactory);

registerSingleton(IPackageRegistryService, PackageRegistryService);
