import { EnumProviderService } from 'vs/workbench/parts/maix/_library/common/type';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';

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
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');

export interface ISerialPanelService {
	_serviceBrand: any;

	setContainers(panelContainer: HTMLElement, terminalContainer: HTMLElement): void;

	createTerminal(dev: string): TPromise<any>;
}

export const ISerialPanelService = createDecorator<ISerialPanelService>('serialPanelService');

export const SerialPortActionCategory = localize('serialport', 'Serial Port');
export const CONFIG_KEY_DEFAULT_DEVICE = 'serialport.device';
export const SerialPortActionId = 'ToggleMonitorAction';

