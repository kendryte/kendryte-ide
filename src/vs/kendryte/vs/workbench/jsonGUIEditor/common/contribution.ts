import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { URI } from 'vs/base/common/uri';
import { CONTEXT_JSON_GUI_EDITOR } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/context';
import { ACTION_ID_GUI_SWITCH_TO_JSON, ACTION_LABEL_GUI_SWITCH_TO_JSON } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/actionId';

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
