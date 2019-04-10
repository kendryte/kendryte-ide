import { EnumProviderService } from 'vs/kendryte/vs/platform/config/common/dynamicEnum';
import { Event } from 'vs/base/common/event';
import { OpenOptions, SetOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { CancellationToken } from 'vs/base/common/cancellation';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

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

export interface SerialPortBaseBinding extends NodeJS.ReadWriteStream {
	__serial_port: never; // prevent type merge
	beforeClose: Event<SerialPortCloseReason>;
}

export interface ISerialPortService extends EnumProviderService<SerialPortItem> {
	_serviceBrand: any;

	onDefaultDeviceChanged: Event<void>;

	refreshDevices(): void;
	openPort(serialDevice: string, opts?: Partial<OpenOptions>, exclusive?: boolean): Promise<SerialPortBaseBinding>;
	updatePortBaudRate(serialDevice: string | SerialPortBaseBinding, newBaudRate: number): void;
	closePort(serialDevice: string | SerialPortBaseBinding, reason: SerialPortCloseReason): Promise<void>;
	sendReboot(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): Promise<void>;
	sendRebootISPKD233(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): Promise<void>;
	sendRebootISPDan(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): Promise<void>;
	sendFlowControl(port: string | SerialPortBaseBinding, cancel?: CancellationToken, ...controlSeq: SetOptions[]): Promise<void>;
	quickOpenDevice(): Promise<string | undefined>;
	readonly lastSelect: string;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');
