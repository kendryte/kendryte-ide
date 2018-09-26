import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';

export interface ISerialPanelService {
	_serviceBrand: any;

	showConfigPanel(): void;
}

export const ISerialPanelService = createDecorator<ISerialPanelService>('serialPanelService');

export const SerialPortActionCategory = localize('serialport', 'Serial Port');
export const CONFIG_KEY_SRIAL_PORT = 'serialport.pre_defined';
export const ConfigSerialPortActionId = 'ToggleMonitorAction';

export interface ISerialFlasher {
	flash(firmware: Buffer, bootLoader?: Buffer): TPromise<void>;
}

export interface ISerialFlasherConfig {
	devicePath: string;
	// chip
}
