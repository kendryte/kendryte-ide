import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { FpioaEditorAction } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaActions';
import { FpioaEditorInput, FpioaInputFactory } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { FpioaEditor } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/fpioaEditor';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import 'vs/kendryte/vs/workbench/fpioaConfig/node/fpioaService';
import { FpioaHandlerContribution } from 'vs/kendryte/vs/workbench/fpioaConfig/common/replaceEditor';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(FpioaHandlerContribution, LifecyclePhase.Starting);

registerExternalAction(ACTION_CATEGORY_TOOLS, FpioaEditorAction);

Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
	.registerEditorInputFactory(FpioaInputFactory.ID, FpioaInputFactory);

Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
	new EditorDescriptor(
		FpioaEditor,
		FpioaEditor.ID,
		localize('fpioa.editor.label', 'fpioa Editor'),
	),
	new SyncDescriptor(FpioaEditorInput),
);
