import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { localize } from 'vs/nls';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { Extensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel } from 'vs/workbench/parts/maix/browser/maixActions';
import { MaixSettingsEditor } from 'vs/workbench/parts/maix/browser/maixSettingsEditor';
import 'vs/workbench/parts/maix/common/category';
import { MaixSettingsEditorInput, SettingsInputFactory } from 'vs/workbench/parts/maix/common/maixEditorInput';

// Contribute Global Actions
const category = localize('maix', 'Maix');

Registry.as<IWorkbenchActionRegistry>(Extensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel, { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_COMMA }), 'Maix: OpenSettingsAlias', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: ShowMaixSettingsActionId,
		title: `${category}: ${ShowMaixSettingsActionLabel}`,
	},
});

class LockScreenSettingContribution implements IWorkbenchContribution {
	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		/*instantiationService.createInstance(ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel)
			.run();*/
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(LockScreenSettingContribution, LifecyclePhase.Running);

Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
	.registerEditorInputFactory(SettingsInputFactory.ID, SettingsInputFactory);

Registry.as<IEditorRegistry>(EditorExtensions.Editors)
	.registerEditor(new EditorDescriptor(
		MaixSettingsEditor,
		MaixSettingsEditor.ID,
		localize('walkThrough.editor.label', 'Interactive Playground'),
	),
		[new SyncDescriptor(MaixSettingsEditorInput)]);

