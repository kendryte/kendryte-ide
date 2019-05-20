import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { URI } from 'vs/base/common/uri';
import { CONTEXT_JSON_GUI_EDITOR, CONTEXT_JSON_GUI_EDITOR_JSON_MODE } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/context';
import {
	ACTION_ID_GUI_SWITCH_TO_GUI,
	ACTION_ID_GUI_SWITCH_TO_JSON,
	ACTION_LABEL_GUI_SWITCH_TO_GUI,
	ACTION_LABEL_GUI_SWITCH_TO_JSON,
} from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/actionId';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { JsonEditorHandlerContribution } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/replaceEditor';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ShowGuiEditorAction, ShowJsonEditorAction } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/switchEditorAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(JsonEditorHandlerContribution, LifecyclePhase.Starting);

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
	command: {
		id: ACTION_ID_GUI_SWITCH_TO_JSON,
		title: ACTION_LABEL_GUI_SWITCH_TO_JSON,
		iconLocation: {
			dark: URI.parse(require.toUrl('vs/kendryte/vs/platform/vsicons/browser/icons/json_inverse.svg')),
			light: URI.parse(require.toUrl('vs/kendryte/vs/platform/vsicons/browser/icons/json.svg')),
		},
	},
	group: 'navigation',
	order: 1,
	when: CONTEXT_JSON_GUI_EDITOR,
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
	command: {
		id: ACTION_ID_GUI_SWITCH_TO_GUI,
		title: ACTION_LABEL_GUI_SWITCH_TO_GUI,
		iconLocation: {
			dark: URI.parse(require.toUrl('vs/kendryte/vs/platform/vsicons/browser/icons/PreferencesEditor_inverse.svg')),
			light: URI.parse(require.toUrl('vs/kendryte/vs/platform/vsicons/browser/icons/PreferencesEditor.svg')),
		},
	},
	group: 'navigation',
	order: 1.1,
	when: CONTEXT_JSON_GUI_EDITOR_JSON_MODE,
});

registerExternalAction(ACTION_CATEGORY_TOOLS, ShowJsonEditorAction);
registerExternalAction(ACTION_CATEGORY_TOOLS, ShowGuiEditorAction);
