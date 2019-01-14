import { EnumProviderService } from 'vs/kendryte/vs/platform/config/common/dynamicEnum';
import { createDecorator, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import * as SerialPort from 'serialport';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { array_has_diff_cb } from 'vs/kendryte/vs/base/common/utils';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { ninvoke, timeout } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';

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
		this._handlePromise = this._handlePromise.bind(this);

		Object.assign(global, { serialPortService: this });
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

	public async sendFlowControl(port: string | SerialPortBaseBinding, cancel?: CancellationToken, ...controlSeq: SerialPort.SetOptions[]) {
		let serialDevice = this.getPortDevice(port) as SerialPort;
		if (!serialDevice) {
			throw new Error('Cannot find opened port.');
		}

		const set = (input: SerialPort.SetOptions) => {
			return new Promise((resolve, reject) => {
				serialDevice.set(input, (err) => {
					if (err) {
						return reject(err);
					} else {
						return resolve();
					}
				});
			});
		};

		if (cancel) {
			cancel.onCancellationRequested(() => {
				console.log({ dtr: false, rts: false });
			});
		}

		for (const state of controlSeq) {
			if (cancel && cancel.isCancellationRequested) {
				return;
			}
			console.log(state);
			await set(state);
			await timeout(10, cancel);
		}
	}

	public async sendRebootISPDan(port: string | SerialPortBaseBinding, cancel?: CancellationToken) {
		return this.sendFlowControl(port, cancel,
			{ dtr: false, rts: false },	// 1 -> all false
			{ dtr: false, rts: true }, // 2 -> press reset
			{ dtr: true, rts: false }, // 3 -> press boot // 4 -> release reset
			{ dtr: false, rts: false }, // 4 -> release boot
		);
	}

	public async sendRebootISPKD233(port: string | SerialPortBaseBinding, cancel?: CancellationToken) {
		return this.sendFlowControl(port, cancel,
			{ dtr: false, rts: false },	// 1 -> all false
			{ dtr: true }, // 2 -> press reset
			{ rts: true }, // 3 -> press boot
			{ dtr: false }, // 4 -> release reset
			{ dtr: false, rts: false }, // 4 -> release boot
		);
	}

	public sendReboot(port: string | SerialPortBaseBinding, cancel?: CancellationToken) {
		return this.sendFlowControl(port, cancel,
			{ dtr: false, rts: false },	// 1 -> all false
			{ dtr: true }, // 2 -> press reset
			{ dtr: false, rts: false }, // 4 -> release boot
		);
	}

	private _handlePromise<T>(what: string, action: (cb: (e: Error, data?: T) => void) => void): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			action((err: Error, data: T) => {
				if (err) {
					this.logService.error(`[serial port] ${what} Failed:`, err);
					reject(err);
				} else {
					this.logService.info(`[serial port] ${what} OK:`, data);
					resolve(data);
				}
			});
		});
	}

	public openPort(serialDevice: string, opts: Partial<SerialPort.OpenOptions> = {}, exclusive = false): TPromise<SerialPort & SerialPortBaseBinding> {
		if (this.openedPorts.has(serialDevice)) {
			const exists = this.openedPorts.get(serialDevice);
			if (exclusive) {
				return this._handlePromise<void>('close serial port for re-open', (cb) => {
					exists.close(cb);
				}).then(() => {
					return this.openPort(serialDevice, opts, exclusive);
				});
			} else {
				return this._handlePromise('update serial port', (cb) => {
					exists.update(opts, cb);
				});
			}
		}
		opts = {
			lock: false,
			...opts,
			autoOpen: false,
		};
		this.logService.info(`open serial port ${serialDevice} ${exclusive ? '[EXCLUSIVE] ' : ''}with:`, serialDevice, opts, exclusive);
		const port: SerialPort & SerialPortBaseBinding = new SerialPort(serialDevice, opts) as any;
		port.on('close', () => {
			this.logService.info('[serial port] ' + serialDevice + ' is end!');
			port.removeAllListeners();
			this.openedPorts.delete(serialDevice);
		});
		this.openedPorts.set(serialDevice, port);
		return this._handlePromise(`open device {${serialDevice}}`, (cb) => {
			port.open(cb);
		}).then(() => {
			return this._handlePromise('get current settings', (cb) => {
				port.get(cb);
			});
		}).then(() => {
			return this._handlePromise('reset settings', (cb) => {
				port.set({
					brk: false,
					cts: false,
					dsr: false,
					dtr: false,
					rts: false,
				}, cb);
			});
		}).then(() => {
			return port;
		});
	}
}

export interface ISerialPortService extends EnumProviderService<SerialPortItem> {
	_serviceBrand: any;

	refreshDevices(): void;
	openPort(serialDevice: string, opts?: Partial<SerialPort.OpenOptions>, exclusive?: boolean): TPromise<SerialPortBaseBinding>;
	closePort(serialDevice: string | SerialPortBaseBinding): TPromise<void>;
	sendReboot(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): TPromise<void>;
	sendRebootISPKD233(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): TPromise<void>;
	sendRebootISPDan(serialDevice: string | SerialPortBaseBinding, cancel?: CancellationToken): TPromise<void>;
	sendFlowControl(port: string | SerialPortBaseBinding, cancel?: CancellationToken, ...controlSeq: SerialPort.SetOptions[]): Promise<void>;
}

export const ISerialPortService = createDecorator<ISerialPortService>('serialPortService');
registerSingleton(ISerialPortService, SerialPortService);
