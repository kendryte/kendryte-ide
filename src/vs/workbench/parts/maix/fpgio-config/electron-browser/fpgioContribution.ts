import { localize } from 'vs/nls';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { FpgioEditorAction } from 'vs/workbench/parts/maix/fpgio-config/browser/fpgioActions';
import { FpgioEditorInput, FpgioInputFactory } from 'vs/workbench/parts/maix/fpgio-config/browser/fpgioEditorInput';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { FpgioEditor } from 'vs/workbench/parts/maix/fpgio-config/browser/editor/fpgioEditor';

// Contribute Global Actions
const category = localize('maix', 'Maix');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(FpgioEditorAction, FpgioEditorAction.ID, FpgioEditorAction.LABEL), 'Maix: Fpgio Editor', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: FpgioEditorAction.ID,
		title: `${category}: ${FpgioEditorAction.LABEL}`,
	},
});

Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
	.registerEditorInputFactory(FpgioInputFactory.ID, FpgioInputFactory);

Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
	new EditorDescriptor(
		FpgioEditor,
		FpgioEditor.ID,
		localize('fpgio.editor.label', 'FPGIO Editor'),
	),
	new SyncDescriptor(FpgioEditorInput),
);
