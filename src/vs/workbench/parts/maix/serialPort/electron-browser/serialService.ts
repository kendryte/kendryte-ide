import * as SerialPort from 'serialport';
import { TPromise } from 'vs/base/common/winjs.base';
import { Emitter } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ISerialPortService, SerialPortItem } from 'vs/workbench/parts/maix/serialPort/common/type';
import { array_has_diff } from 'vs/workbench/parts/maix/_library/common/utils';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';

export const KEYBINDING_CONTEXT_SERIAL_TERMINAL_FOCUS = new RawContextKey<boolean>('terminalFocus', undefined);

class SerialPortService implements ISerialPortService {
	_serviceBrand: any;
	private devicesListChange = new Emitter<string[]>();

	private memSerialDeviceNames: string[];
	private memSerialDevices: SerialPortItem[];

	private cachedPromise: TPromise<void>;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		this.refreshDevices();
	}

	public refreshDevices() {
		console.info('refreshing COM device list');
		if (this.cachedPromise) {
			return this.cachedPromise;
		}
		this.cachedPromise = this._refreshDevices().then((d) => {
			delete this.cachedPromise;
		});
		return this.cachedPromise;
	}

	private async _refreshDevices(): TPromise<void> {
		this.memSerialDevices = await SerialPort.list();
		Object.freeze(this.memSerialDevices);

		const last = this.memSerialDeviceNames;
		this.memSerialDeviceNames = this.memSerialDevices.map((item) => {
			return item.comName;
		});
		Object.freeze(this.memSerialDeviceNames);

		if (!last || array_has_diff(this.memSerialDeviceNames, last)) {
			this.devicesListChange.fire(this.memSerialDeviceNames);
		}
	}

	public getValues(): TPromise<string[]> {
		if (this.memSerialDeviceNames) {
			return TPromise.as(this.memSerialDeviceNames);
		} else {
			return this.refreshDevices().then(_ => TPromise.as(this.memSerialDeviceNames));
		}
	}

	public getDevices(): TPromise<SerialPortItem[]> {
		if (this.memSerialDevices) {
			return TPromise.as(this.memSerialDevices);
		} else {
			return this.refreshDevices().then(_ => TPromise.as(this.memSerialDevices));
		}
	}

	public onChange(cb) {
		return this.devicesListChange.event(cb);
	}
}

registerSingleton(ISerialPortService, SerialPortService);
