import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindowControlService';
import { TPromise } from 'vs/base/common/winjs.base';
import { CONTEXT_IN_SERIAL_PORT_OUTPUT, SERIAL_MONITOR_ACTION_CLEAR, SerialPortActionCategory, } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { registerActionWithKey } from 'vs/kendryte/vs/base/common/registerAction';
import { ClearTerminalAction } from 'vs/workbench/parts/terminal/electron-browser/terminalActions';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Action } from 'vs/base/common/actions';

export class SerialPortClearAction extends Action {
	public static readonly ID = SERIAL_MONITOR_ACTION_CLEAR;
	public static readonly LABEL = ClearTerminalAction.LABEL;

	constructor(
		id: string,
		label: string,
		@ISerialMonitorControlService private serialMonitorControlService: ISerialMonitorControlService,
	) {
		super(id, label, 'terminal-action octicon octicon-trashcan');
	}

	public run(event?: any): TPromise<void> {
		this.serialMonitorControlService.clearScreen();
		return TPromise.as(void 0);
	}
}

registerActionWithKey(SerialPortActionCategory, SerialPortClearAction, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_K,
	linux: { primary: null },
}, CONTEXT_IN_SERIAL_PORT_OUTPUT);
