import { localize } from 'vs/nls';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { FpioaEditorAction } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaActions';
import { FpioaEditorInput, FpioaInputFactory } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { FpioaEditor } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/fpioaEditor';

// Contribute Global Actions
const category = localize('kendryte', 'Kendryte');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(FpioaEditorAction, FpioaEditorAction.ID, FpioaEditorAction.LABEL), 'Kendryte: fpioa Editor', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: FpioaEditorAction.ID,
		title: `${category}: ${FpioaEditorAction.LABEL}`,
	},
});

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
