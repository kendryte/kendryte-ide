import { EnumProviderService } from 'vs/kendryte/vs/platform/common/type';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import * as SerialPort from 'serialport';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { addStatusBarButtons } from 'vs/kendryte/vs/workbench/serialPort/common/buttons';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { array_has_diff_cb } from 'vs/kendryte/vs/platform/common/utils';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { ninvoke } from 'vs/base/common/async';

function testSame(a: SerialPortItem, b: SerialPortItem) {
	return a.comName === b.comName && a.locationId === b.locationId && a.manufacturer === b.manufacturer && a.pnpId === b.pnpId && a.productId === b.productId && a.serialNumber === b.serialNumber && a.vendorId === b.vendorId;
}

class SerialPortService implements ISerialPortService {
	_serviceBrand: any;
	private devicesListChange = new Emitter<SerialPortItem[]>();

	private memSerialDevices: SerialPortItem[];

	private cachedPromise: TPromise<void>;
	private openedPorts = new Map<string, SerialPort & SerialPortBaseBinding>();

	public readonly onChange: Event<SerialPortItem[]> = this.devicesListChange.event;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@ILogService private logService: ILogService,
	) {
		instantiationService.invokeFunction(addStatusBarButtons);
		this.refreshDevices();
		lifecycleService.onWillShutdown(async () => {
			for (const port of Array.from<SerialPort>(this.openedPorts.values())) {
				await ninvoke(port, port.close).then(undefined, (e: Error) => {
					this.logService.error(e);
				});
			}
			return true;
		});
	}

	public refreshDevices() {
		if (this.cachedPromise) {
			return this.cachedPromise;
		}
		this.cachedPromise = this._refreshDevices().then((d) => {
			delete this.cachedPromise;
		});
		return this.cachedPromise;
	}

	private async _refreshDevices(): TPromise<void> {
		this.logService.info('Refreshing COM device list...');
		const last = this.memSerialDevices;
		this.memSerialDevices = await SerialPort.list();
		Object.freeze(this.memSerialDevices);
		this.logService.info('COM device list: ', this.memSerialDevices);

		if (!last || array_has_diff_cb(this.memSerialDevices, last, testSame)) {
			this.devicesListChange.fire(this.memSerialDevices);
		}
	}

	public getValues(): TPromise<SerialPortItem[]> {
		if (this.memSerialDevices) {
			return TPromise.as(this.memSerialDevices);
		} else {
			return this.refreshDevices().then(_ => TPromise.as(this.memSerialDevices));
		}
	}

	public closePort(serialDevice: string | SerialPortBaseBinding): TPromise<void> {
		if (typeof serialDevice === 'string') {
			if (!this.openedPorts.has(serialDevice)) {
				return TPromise.as(void 0);
			}
			serialDevice = this.openedPorts.get(serialDevice);
		}

		return ninvoke(serialDevice, (serialDevice as any as SerialPort).close);
	}

	public openPort(serialDevice: string, opts: Partial<SerialPort.OpenOptions> = {}, exclusive = false): TPromise<SerialPort & SerialPortBaseBinding> {
		if (this.openedPorts.has(serialDevice)) {
			const exists = this.openedPorts.get(serialDevice);
			if (exclusive) {
				return new TPromise((resolve, reject) => {
					const wrappedCallback = (err) => {
						console.log('close serial port for re-open (err=%s)', err);
						return err ? reject(err) : resolve(void 0);
					};
					exists.close(wrappedCallback);
				}).then(() => {
					return this.openPort(serialDevice, opts, exclusive);
				});
			} else {
				return new TPromise((resolve, reject) => {
					const wrappedCallback = (err) => {
						console.log('update serial port (err=%s)', err);
						return err ? reject(err) : resolve(exists);
					};
					exists.update(opts, wrappedCallback);
				});
			}
		}
		opts = {
			lock: false,
			...opts,
			autoOpen: false,
		};
		console.log('open serial port %s with %o (exclusive=%s)', serialDevice, opts, exclusive);
		const port: SerialPort & SerialPortBaseBinding = new SerialPort(serialDevice, opts) as any;
		port.on('close', () => {
			this.logService.info('[serial port] ' + serialDevice + ' is end!');
			port.removeAllListeners();
			this.openedPorts.delete(serialDevice);
		});
		this.openedPorts.set(serialDevice, port);
		return new TPromise((resolve, reject) => {
			port.open((error: Error) => {
				if (error) {
					console.log('can not open serial port (err=%s)', error);
					this.logService.warn('[serial port] ' + serialDevice + ' failed to open');
					reject(error);
					this.openedPorts.delete(serialDevice);
				} else {
					console.log('new serial port (%s)', serialDevice, port);
					this.logService.info('[serial port] ' + serialDevice + ' open ok');
					resolve(port);
				}
			});
		});
	}
}

export interface ISerialPortService extends EnumProviderService<SerialPortItem> {
	_serviceBrand: any;

	refreshDevices(): void;

	openPort(serialDevice: string, opts?: Partial<SerialPort.OpenOptions>, exclusive?: boolean): TPromise<SerialPortBaseBinding>;

	closePort(serialDevice: string | SerialPortBaseBinding): TPromise<void>;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');
registerSingleton(ISerialPortService, SerialPortService);
