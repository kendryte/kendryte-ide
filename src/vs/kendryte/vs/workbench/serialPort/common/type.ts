import { TPromise } from 'vs/base/common/winjs.base';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const ConfigSerialPortActionId = 'ToggleMonitorAction';

export const SERIAL_PORT_HISTORY_STORAGE_KEY = 'storage.serial-port.history';

export const SERIAL_PANEL_ID = 'workbench.panel.kendryte.serial-port';
export const SERIAL_PANEL_OUTPUT_PANEL_ID = 'workbench.panel.kendryte.serial-port-output';

export const SERIAL_MONITOR_ACTION_TOGGLE = 'workbench.action.kendryte.serial-port.toggle';
export const SERIAL_MONITOR_ACTION_REFRESH_DEVICE = 'workbench.action.kendryte.serial-port.reload-devices';
export const SERIAL_MONITOR_ACTION_REPL_ENTER = 'serial-port.action.acceptInput';
export const SERIAL_MONITOR_ACTION_CLEAR = 'workbench.action.kendryte.serial-port.monitor.clear';
export const SERIAL_MONITOR_ACTION_COPY = 'workbench.action.kendryte.serial-port.monitor.copy';
export const SERIAL_MONITOR_ACTION_PASTE = 'workbench.action.kendryte.serial-port.monitor.paste';
export const SERIAL_MONITOR_ACTION_FOCUS_FIND_WIDGET = 'workbench.action.kendryte.serial-port.find.widget.focus';

export const CONTEXT_IN_SERIAL_PORT_REPL = new RawContextKey<boolean>('inSerialPortRepl', false);
export const CONTEXT_IN_SERIAL_PORT_OUTPUT = new RawContextKey<boolean>('inSerialPortReplOutput', false);
export const CONTEXT_SERIAL_PORT_FIND_WIDGET_INPUT_FOCUSED = new RawContextKey<boolean>('inSerialPortFindInput', false);
export const CONTEXT_SERIAL_PORT_FIND_WIDGET_FOCUSED = new RawContextKey<boolean>('inSerialPortFind', false);
export const CONTEXT_SERIAL_PORT_HAS_SELECT = new RawContextKey<boolean>('serialOutputTextSelected', undefined);

export interface ISerialFlasher {
	flash(firmware: Buffer, bootLoader?: Buffer): TPromise<void>;
}

export interface ISerialFlasherConfig {
	devicePath: string;
	// chip
}

export interface SerialPortItem { // copy out from serial port package
	comName: string;
	locationId?: undefined;
	manufacturer?: undefined;
	pnpId?: undefined;
	productId?: undefined;
	serialNumber?: undefined;
	vendorId?: undefined;
}

export enum SerialPortCloseReason {
	Unknown,
	Exclusive,
	MainShutdown,
	FlashComplete,
	UserAction,
}
