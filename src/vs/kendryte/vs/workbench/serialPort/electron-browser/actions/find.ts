import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindowControlService';
import { TPromise } from 'vs/base/common/winjs.base';
import { CONTEXT_IN_SERIAL_PORT_OUTPUT, SERIAL_MONITOR_ACTION_FOCUS_FIND_WIDGET, SerialPortActionCategory, } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { registerActionWithKey } from 'vs/kendryte/vs/platform/common/registerAction';
import { FocusTerminalFindWidgetAction } from 'vs/workbench/parts/terminal/electron-browser/terminalActions';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Action } from 'vs/base/common/actions';

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

	public run(event?: any): TPromise<void> {
		// console.log('!!! SerialPortShowFindAction');
		this.serialMonitorControlService.focusFindWidget();
		return TPromise.as(void 0);
	}
}

registerActionWithKey(SerialPortActionCategory, SerialPortShowFindAction, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_F,
}, CONTEXT_IN_SERIAL_PORT_OUTPUT);
