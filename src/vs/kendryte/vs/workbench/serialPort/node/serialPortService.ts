import { EnumProviderService } from 'vs/kendryte/vs/platform/config/common/dynamicEnum';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import * as SerialPort from 'serialport';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { addStatusBarButtons } from 'vs/kendryte/vs/workbench/serialPort/common/buttons';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { array_has_diff_cb } from 'vs/kendryte/vs/base/common/utils';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { ninvoke, timeout } from 'vs/base/common/async';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';

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
		Object.assign(global, { serialPortService: this });
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

	private getPortDevice(serialDevice: string | SerialPortBaseBinding): (SerialPort & SerialPortBaseBinding) | void {
		if (typeof serialDevice === 'string') {
			return this.openedPorts.get(serialDevice);
		} else {
			return serialDevice as any;
		}
	}

	public closePort(port: string | SerialPortBaseBinding): TPromise<void> {
		const serialDevice = this.getPortDevice(port);
		if (!serialDevice) {
			return TPromise.as(void 0);
		}

		return ninvoke(serialDevice, (serialDevice as any as SerialPort).close).then(undefined, (e) => {
			if (/Port is not open/.test(e.message)) {
				return void 0;
			} else {
				throw e;
			}
		});
	}

	public async sendReboot(port: string | SerialPortBaseBinding, isp: boolean, cancel?: CancellationToken) {
		let serialDevice = this.getPortDevice(port) as SerialPort;
		if (!serialDevice) {
			throw new Error('Cannot find opened port.');
		}

		const set = (input: SerialPort.SetOptions) => {
			console.log(input);
			return new Promise((resolve, reject) => {
				const wrappedCallback = (err) => err ? reject(err) : resolve();
				serialDevice.set(input, wrappedCallback);
			});
		};

		let uncancelable: IDisposable;
		if (!cancel) {
			const ts = uncancelable = new CancellationTokenSource();
			cancel = ts.token;
		}
		cancel.onCancellationRequested(() => {
			console.log({ dtr: false, rts: false });
		});

		// 1 -> all false
		await set({ dtr: false, rts: false });
		if (cancel.isCancellationRequested) return;
		await timeout(10, cancel);

		// 2 -> press down reset
		await set({ dtr: true });
		if (cancel.isCancellationRequested) return;
		await timeout(10, cancel);

		// 3 -> press down boot
		await set({ rts: true });
		if (cancel.isCancellationRequested) return;
		await timeout(10, cancel);

		if (isp) {
			// 4 -> release reset
			await set({ dtr: false });
			if (cancel.isCancellationRequested) return;
			await timeout(10, cancel);
		}

		// 4 -> return to normal
		await set({ dtr: false, rts: false });

		if (uncancelable) {
			uncancelable.dispose();
		}
	}

	public openPort(serialDevice: string, opts: Partial<SerialPort.OpenOptions> = {}, exclusive = false): TPromise<SerialPort & SerialPortBaseBinding> {
		if (this.openedPorts.has(serialDevice)) {
			const exists = this.openedPorts.get(serialDevice);
			if (exclusive) {
				return new TPromise((resolve, reject) => {
					const wrappedCallback = (err) => {
						this.logService.info('close serial port for re-open (err=%s)', err);
						return err ? reject(err) : resolve(void 0);
					};
					exists.close(wrappedCallback);
				}).then(() => {
					return this.openPort(serialDevice, opts, exclusive);
				});
			} else {
				return new TPromise((resolve, reject) => {
					const wrappedCallback = (err) => {
						this.logService.info('update serial port (err=%s)', err);
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
		this.logService.info('open serial port %s with %o (exclusive=%s)', serialDevice, opts, exclusive);
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
					this.logService.info('can not open serial port (err=%s)', error);
					this.logService.warn('[serial port] ' + serialDevice + ' failed to open');
					reject(error);
					this.openedPorts.delete(serialDevice);
				} else {
					this.logService.info('new serial port (%s)', serialDevice, port);
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
	sendReboot(serialDevice: string | SerialPortBaseBinding, isp: boolean, cancel?: CancellationToken): TPromise<void>;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');
registerSingleton(ISerialPortService, SerialPortService);
