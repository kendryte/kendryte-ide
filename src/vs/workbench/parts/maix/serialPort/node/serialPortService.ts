import { EnumProviderService } from 'vs/workbench/parts/maix/_library/common/type';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
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
