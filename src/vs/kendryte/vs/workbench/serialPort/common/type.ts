import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IPrivateReplService } from 'vs/workbench/parts/debug/electron-browser/repl';

export const SerialPortActionCategory = localize('serialport', 'Serial Port');
export const CONFIG_KEY_SRIAL_PORT = 'serialport.pre_defined';
export const ConfigSerialPortActionId = 'ToggleMonitorAction';

export const SERIAL_PORT_HISTORY_STORAGE_KEY = 'storage.serial-port.history';

export const SERIAL_PANEL_ID = 'workbench.panel.kendryte.serial-port';
export const SERIAL_PANEL_OUTPUT_PANEL_ID = 'workbench.panel.kendryte.serial-port-output';

export const SERIAL_MONITOR_ACTION_TOGGLE = 'workbench.action.kendryte.serial-port.toggle';
export const SERIAL_MONITOR_ACTION_REFRESH_DEVICE = 'workbench.action.kendryte.serial-port.reload-devices';
export const SERIAL_MONITOR_ACTION_REPL_ENTER = 'serial-port.action.acceptInput';

export const CONTEXT_IN_SERIAL_PORT_REPL = new RawContextKey<boolean>('inSerialPortRepl', false);
export const CONTEXT_IN_SERIAL_PORT_OUTPUT = new RawContextKey<boolean>('inSerialPortReplOutput', false);

export interface ISerialPrivateReplService extends IPrivateReplService {
}

export const ISerialPrivateReplService = createDecorator<IPrivateReplService>('serialPortReplService');

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

export interface ISerialPortStatus {
	hasOpen: boolean;
	portItem: SerialPortItem;
}