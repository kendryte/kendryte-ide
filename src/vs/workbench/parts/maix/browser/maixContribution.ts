import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { localize } from 'vs/nls';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import {
	Extensions as WorkbenchExtensions,
	IWorkbenchContribution,
	IWorkbenchContributionsRegistry
} from 'vs/workbench/common/contributions';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel } from 'vs/workbench/parts/maix/browser/maixActions';
import { MaixSettingsEditor } from 'vs/workbench/parts/maix/browser/frame/maixSettingsEditor';
import { MaixSettingsEditorInput, SettingsInputFactory } from 'vs/workbench/parts/maix/common/maixEditorInput';
import { PopMaixSettingsAction, PopMaixSettingsActionId, PopMaixSettingsActionLabel } from './maixActions';
import {
	Extensions as ConfigurationExtensions,
	IConfigurationPropertySchema,
	IConfigurationRegistry
} from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as CategoryExtensions, IConfigCategoryRegistry } from 'vs/workbench/parts/maix/common/category';

// Contribute Global Actions
const category = localize('maix', 'Maix');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel, { primary: KeyMod.CtrlCmd | KeyCode.US_COMMA }), 'Maix: OpenSettingsAlias', category);

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(PopMaixSettingsAction, PopMaixSettingsActionId, PopMaixSettingsActionLabel, { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_COMMA }), 'Maix: OpenSettingsAlias', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: ShowMaixSettingsActionId,
		title: `${category}: ${ShowMaixSettingsActionLabel}`,
	},
});


class LockScreenSettingContribution implements IWorkbenchContribution {
	private registry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
	private categoryRegistry = Registry.as<IConfigCategoryRegistry>(CategoryExtensions.ConfigCategory);

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		/*instantiationService.createInstance(ShowMaixSettingsAction, ShowMaixSettingsActionId, ShowMaixSettingsActionLabel)
			.run();*/

		// configurationService.getConfigurationData()
		Object.keys(this.registry.getConfigurationProperties()).forEach((key: string) => this.checkCategory(key));
		this.registry.onDidRegisterConfiguration((keys: string[]) => keys.forEach(this.checkCategory, this));
	}

	private checkCategory(key: string) {
		const schema: IConfigurationPropertySchema = this.registry.getConfigurationProperties()[key];
		if (schema.hasOwnProperty('category')) {
			this.categoryRegistry.addSetting((schema as any).category, key);
		}
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
		localize('maix.editor.label', 'Settings Editor'),
	),
		[new SyncDescriptor(MaixSettingsEditorInput)]);

