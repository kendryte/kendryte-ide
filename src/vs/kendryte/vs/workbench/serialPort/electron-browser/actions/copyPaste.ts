import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { CopyTerminalSelectionAction, TerminalPasteAction } from 'vs/workbench/parts/terminal/electron-browser/terminalActions';
import {
	CONTEXT_IN_SERIAL_PORT_OUTPUT,
	CONTEXT_SERIAL_PORT_HAS_SELECT,
	SERIAL_MONITOR_ACTION_COPY,
	SERIAL_MONITOR_ACTION_PASTE,
	SerialPortActionCategory,
} from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialMonitorControlService } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindowControlService';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { registerActionWithKey } from 'vs/kendryte/vs/platform/common/registerAction';

export class SerialPortCopyAction extends Action {
	public static readonly ID = SERIAL_MONITOR_ACTION_COPY;
	public static readonly LABEL = CopyTerminalSelectionAction.LABEL;

	constructor(
		id: string,
		label: string,
		@ISerialMonitorControlService private serialMonitorControlService: ISerialMonitorControlService,
	) {
		super(id, label, 'terminal-action octicon octicon-copy');
	}

	public run(event?: any): TPromise<void> {
		// console.log('SerialPortCopyAction');
		this.serialMonitorControlService.copySelection();
		return TPromise.as(void 0);
	}
}

registerActionWithKey(SerialPortActionCategory, SerialPortCopyAction, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_C,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_C },
}, ContextKeyExpr.and(CONTEXT_IN_SERIAL_PORT_OUTPUT, CONTEXT_SERIAL_PORT_HAS_SELECT));

export class SerialPortPasteAction extends Action {
	public static readonly ID = SERIAL_MONITOR_ACTION_PASTE;
	public static readonly LABEL = TerminalPasteAction.LABEL;

	constructor(
		id: string,
		label: string,
		@ISerialMonitorControlService private serialMonitorControlService: ISerialMonitorControlService,
	) {
		super(id, label, 'terminal-action octicon octicon-paste');
	}

	public run(event?: any): TPromise<void> {
		// console.log('SerialPortPasteAction');
		this.serialMonitorControlService.paste();
		return TPromise.as(void 0);
	}
}

registerActionWithKey(SerialPortActionCategory, SerialPortPasteAction, {
	primary: KeyMod.CtrlCmd | KeyCode.KEY_V,
	linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KEY_V },
}, CONTEXT_IN_SERIAL_PORT_OUTPUT);