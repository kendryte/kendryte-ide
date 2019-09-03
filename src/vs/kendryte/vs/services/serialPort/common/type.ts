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

export interface ISerialPortInstance extends NodeJS.ReadWriteStream {
	onLogicalClose: Event<void>;
	onLogicalOpen: Event<void>;
	onDispose: Event<void>;

	flush(): Promise<void>;
	flowControl(value: SetOptions): Promise<void>;
	setBaudrate(newBr: number): Promise<void>;
	setOptions(newOpts: OpenOptions): Promise<void>;
	dispose(): void;
}

export interface ISerialPortManager {
	readonly deviceName: string;

	closePort(stream: ISerialPortInstance): Promise<void>;
	openPort(options: OpenOptions, exclusive?: boolean): Promise<ISerialPortInstance>;
}

export type ISerialRebootSequence = SetOptions[];

export interface ISerialPortService extends EnumProviderService<SerialPortItem> {
	_serviceBrand: any;

	onDefaultDeviceChanged: Event<void>;

	refreshDevices(): void;
	getPortManager(serialDevice: string): ISerialPortManager;
	destroyPortManager(serialDevice: string | ISerialPortManager): Promise<void>;
	sendFlowControl(port: string | ISerialPortManager | ISerialPortInstance, controlSeq: ISerialRebootSequence, cancel?: CancellationToken): Promise<void>;
	quickOpenDevice(): Promise<string | undefined>;
	readonly lastSelect: string;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');
