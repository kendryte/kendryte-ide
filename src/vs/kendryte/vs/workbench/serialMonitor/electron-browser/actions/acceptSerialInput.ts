import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { EditorAction, registerEditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import * as nls from 'vs/nls';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { CONTEXT_IN_SERIAL_PORT_REPL, SERIAL_MONITOR_ACTION_REPL_ENTER } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { ISerialPrivateReplService } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialPrivateReplService';

class AcceptReplInputAction extends EditorAction {
	static readonly ID = SERIAL_MONITOR_ACTION_REPL_ENTER;
	static readonly LABEL = nls.localize({
		key: 'actions.serial-port.acceptInput',
		comment: ['Apply input from the serial port monitor input box'],
	}, 'Serial Monitor Accept Input');

	constructor() {
		super({
			id: AcceptReplInputAction.ID,
			label: AcceptReplInputAction.LABEL,
			alias: 'Serial Monitor Accept Input',
			precondition: CONTEXT_IN_SERIAL_PORT_REPL,
			kbOpts: {
				kbExpr: EditorContextKeys.textInputFocus,
				primary: KeyMod.CtrlCmd | KeyCode.Enter,
				weight: KeybindingWeight.EditorContrib,
			},
		});
	}

	public run(accessor: ServicesAccessor, editor: ICodeEditor): void | Promise<void> {
		accessor.get<ISerialPrivateReplService>(ISerialPrivateReplService).acceptReplInput();
	}
}

registerEditorAction(AcceptReplInputAction);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: AcceptReplInputAction.ID,
		title: `${AcceptReplInputAction.LABEL}`,
	},
});