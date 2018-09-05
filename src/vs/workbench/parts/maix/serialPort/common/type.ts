import { EnumProviderService } from 'vs/workbench/parts/maix/_library/common/type';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { ILogService } from 'vs/platform/log/common/log';
import SerialPort = require('serialport');

export interface SerialPortItem {
	comName: string;
	locationId?: undefined;
	manufacturer?: undefined;
	pnpId?: undefined;
	productId?: undefined;
	serialNumber?: undefined;
	vendorId?: undefined;
}

export interface ISerialPortService extends EnumProviderService {
	_serviceBrand: any;

	getDevices(): TPromise<SerialPortItem[]>;

	refreshDevices(): void;

	quickOpenDevice(): TPromise<string | void>;

	openPort(serialDevice: string, opts?: Partial<SerialPort.OpenOptions>, exclusive?: boolean): TPromise<SerialPort>;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');

export interface ISerialPanelService {
	_serviceBrand: any;

	showConfigPanel(): void;
}

export const ISerialPanelService = createDecorator<ISerialPanelService>('serialPanelService');

export const SerialPortActionCategory = localize('serialport', 'Serial Port');
export const CONFIG_KEY_SRIAL_PORT = 'serialport.pre_defined';
export const ConfigSerialPortActionId = 'ToggleMonitorAction';

export interface ISerialFlasher {
	flash(firmware: Buffer, bootLoader?: Buffer): TPromise<void>
}

export interface ISerialFlasherConfig {
	devicePath: string;
	// chip
}

export interface ISerialFlasherConstructor {
	new(device: SerialPort, logger: ILogService): ISerialFlasher;
}
