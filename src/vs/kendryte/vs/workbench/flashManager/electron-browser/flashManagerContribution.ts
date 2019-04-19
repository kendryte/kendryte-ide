import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { registerFlashSchemas } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { FlashManagerHandlerContribution } from 'vs/kendryte/vs/workbench/flashManager/common/replaceEditor';
import { registerActionWithKey, registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';
import { OpenFlashManagerAction } from 'vs/kendryte/vs/workbench/flashManager/common/openFlashManagerAction';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { FlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/node/flashManagerService';
import { EditorDescriptor, Extensions as EditorExtensions, IEditorRegistry } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Extensions as EditorInputExtensions, IEditorInputFactoryRegistry } from 'vs/workbench/common/editor';
import { KENDRYTE_PACKAGE_JSON_EDITOR_TITLE } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { FlashManagerEditorInput, FlashManagerEditorInputFactory } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { FlashManagerEditor } from 'vs/kendryte/vs/workbench/flashManager/browser/editor/main';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { FlashManagerFocusContext } from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { SaveFlashConfigAction } from 'vs/kendryte/vs/workbench/flashManager/common/saveAction';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(FlashManagerHandlerContribution, LifecyclePhase.Starting);

registerFlashSchemas((id, schema) => {
	Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution).registerSchema(id, schema);
});

Registry.as<IEditorRegistry>(EditorExtensions.Editors).registerEditor(
	new EditorDescriptor(
		FlashManagerEditor,
		FlashManagerEditor.ID,
		KENDRYTE_PACKAGE_JSON_EDITOR_TITLE,
	),
	[
		new SyncDescriptor(FlashManagerEditorInput),
	],
);
Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories)
	.registerEditorInputFactory(FlashManagerEditor.ID, FlashManagerEditorInputFactory);

registerSingleton(IFlashManagerService, FlashManagerService);
registerExternalAction(ACTION_CATEGORY_TOOLS, OpenFlashManagerAction);

registerActionWithKey(
	ACTION_CATEGORY_TOOLS,
	SaveFlashConfigAction,
	{ primary: KeyCode.KEY_S + KeyMod.CtrlCmd },
	FlashManagerFocusContext,
	KeybindingWeight.ExternalExtension,
);

