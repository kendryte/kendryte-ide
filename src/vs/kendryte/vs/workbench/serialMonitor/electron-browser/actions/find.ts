import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindowControlService';
import { CONTEXT_IN_SERIAL_PORT_OUTPUT, SERIAL_MONITOR_ACTION_FOCUS_FIND_WIDGET } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import { registerActionWithKey } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { FocusTerminalFindWidgetAction } from 'vs/workbench/contrib/terminal/browser/terminalActions';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Action } from 'vs/base/common/actions';
import { KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ACTION_CATEGORY_SERIAL_PORT } from 'vs/kendryte/vs/base/common/menu/serialPort';

export class SerialPortShowFindAction extends Action {
	public static readonly ID = SERIAL_MONITOR_ACTION_FOCUS_FIND_WIDGET;
	public static readonly LABEL = FocusTerminalFindWidgetAction.LABEL;

	constructor(
		id: string,
		label: string,
		@ISerialMonitorControlService private serialMonitorControlService: ISerialMonitorControlService,
	) {
		super(id, label, 'terminal-action octicon octicon-find');
	}

	public run(event?: any): Promise<void> {
		// console.log('!!! SerialPortShowFindAction');
		this.serialMonitorControlService.focusFindWidget();
		return Promise.resolve(void 0);
	}
}

registerActionWithKey(ACTION_CATEGORY_SERIAL_PORT, SerialPortShowFindAction, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_F,
}, CONTEXT_IN_SERIAL_PORT_OUTPUT, KeybindingWeight.WorkbenchContrib + 3);
