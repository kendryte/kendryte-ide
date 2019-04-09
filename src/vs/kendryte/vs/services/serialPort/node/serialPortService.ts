import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as SerialPort from 'serialport';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { ISerialPortService, SerialPortBaseBinding, SerialPortCloseReason, SerialPortItem } from 'vs/kendryte/vs/services/serialPort/common/type';
import { array_has_diff_cb } from 'vs/kendryte/vs/base/common/utils';
import { OpenOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { timeout } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IQuickInputService, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { promisify } from 'util';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { CONFIG_KEY_FILTER_EMPTY_DEVICES } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';

const SELECT_STORAGE_KEY = 'serial-port.last-selected';

interface SerialPortEvent {
	_beforeClose: Emitter<SerialPortCloseReason>;
}

type SerialPortInternalType = SerialPort & SerialPortBaseBinding & SerialPortEvent;

function testSame(a: SerialPortItem, b: SerialPortItem) {
	return a.comName === b.comName && a.locationId === b.locationId && a.manufacturer === b.manufacturer && a.pnpId === b.pnpId && a.productId === b.productId && a.serialNumber === b.serialNumber && a.vendorId === b.vendorId;
}

class SerialPortService implements ISerialPortService {
	_serviceBrand: any;
	private readonly _devicesListChange = new Emitter<SerialPortItem[]>();
	public readonly onDynamicEnumChange: Event<SerialPortItem[]> = this._devicesListChange.event;

	private readonly _defaultDeviceChanged = new Emitter<void>();
	public readonly onDefaultDeviceChanged = this._defaultDeviceChanged.event;

	private memSerialDevices: SerialPortItem[];

	private cachedPromise: Promise<void>;
	private openedPorts = new ExtendMap<string, SerialPortInternalType>();

	private _lastSelected: string;

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IConfigurationService private configurationService: IConfigurationService,
		@ILogService private logService: ILogService,
		@IStorageService private storageService: IStorageService,
		@IQuickInputService private quickInputService: IQuickInputService,
		@IKendryteStatusControllerService kendryteStatusControllerService: IKendryteStatusControllerService,
	) {
		this._handlePromise = this._handlePromise.bind(this);

		this._lastSelected = storageService.get(SELECT_STORAGE_KEY, StorageScope.WORKSPACE, '');

		Object.assign(global, { serialPortService: this });
		this.refreshDevices();
		lifecycleService.onWillShutdown(async () => {
			for (const port of Array.from<SerialPortBaseBinding>(this.openedPorts.values())) {
				await this.closePort(port, SerialPortCloseReason.MainShutdown).then(undefined, (e: Error) => {
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

	private async _refreshDevices(): Promise<void> {
		this.logService.debug('Refreshing COM device list...');
		const last = this.memSerialDevices;
		this.memSerialDevices = await SerialPort.list();
		const filter = this.configurationService.getValue<boolean>(CONFIG_KEY_FILTER_EMPTY_DEVICES) || false;
		if (filter) {
			this.memSerialDevices = this.memSerialDevices.filter((e) => {
				return !!e.productId;
			});
		}
		Object.freeze(this.memSerialDevices);
		this.logService.trace('COM device list: ', this.memSerialDevices);

		if (!last || array_has_diff_cb(this.memSerialDevices, last, testSame)) {
			this._devicesListChange.fire(this.memSerialDevices);
		}
	}

	public getDynamicEnum(): Promise<SerialPortItem[]> {
		if (this.memSerialDevices) {
			return Promise.resolve(this.memSerialDevices);
		} else {
			return this.refreshDevices().then(() => Promise.resolve(this.memSerialDevices));
		}
	}

	private getPortDevice(serialDevice: string | SerialPortBaseBinding): (SerialPortInternalType) | void {
		if (typeof serialDevice === 'string') {
			return this.openedPorts.get(serialDevice);
		} else {
			return serialDevice as any;
		}
	}

	public closePort(port: string | SerialPortBaseBinding, reason: SerialPortCloseReason): Promise<void> {
		const serialDevice = this.getPortDevice(port);
		if (!serialDevice) {
			return Promise.resolve(void 0);
		}

		if (serialDevice._beforeClose) {
			serialDevice._beforeClose.fire(reason);
		}

		return promisify(serialDevice.close.bind(serialDevice))().then(undefined, (e) => {
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
			this.logService.debug('set port state:', state);
			await set(state);
			await timeout(10, cancel || CancellationToken.None);
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

	get lastSelect() {
		return this._lastSelected;
	}

	public async quickOpenDevice(): Promise<string | undefined> {
		const devices = await this.getDynamicEnum();

		const pickMap = devices.map((item): IQuickPickItem => {
			return {
				id: item.comName,
				label: item.manufacturer ? `${item.comName}: ${item.manufacturer}` : item.comName,
				description: item.serialNumber || item.productId,
				detail: item.pnpId,
				picked: item.comName === this._lastSelected,
			};
		});

		const picked = await this.quickInputService.pick(Promise.resolve(pickMap), { canPickMany: false });
		if (picked && picked.id) { // id is like /dev/ttyUSB0
			this._lastSelected = picked.id;
			this._defaultDeviceChanged.fire();
			this.storageService.store(SELECT_STORAGE_KEY, picked.id, StorageScope.WORKSPACE);
			return picked.id;
		}
		return;
	}

	private _handlePromise<T>(what: string, action: (cb: (e: Error, data?: T) => void) => void): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			action((err: Error, data: T) => {
				if (err) {
					this.logService.error(`[serial port] ${what} Failed:`, err);
					reject(err);
				} else {
					this.logService.debug(`[serial port] ${what} OK:`, data);
					resolve(data);
				}
			});
		});
	}

	public async openPort(serialDevice: string, opts: Partial<OpenOptions> = {}, exclusive = false): Promise<SerialPortInternalType> {
		this.logService.info(`open serial port ${serialDevice} ${exclusive ? '[EXCLUSIVE] ' : ''}with:`, opts);
		if (this.openedPorts.has(serialDevice)) {
			const exists = this.openedPorts.getReq(serialDevice);
			if (exclusive) {
				await this.closePort(serialDevice, SerialPortCloseReason.Exclusive);
				this.openedPorts.delete(serialDevice);
				return this.openPort(serialDevice, opts, exclusive);
			} else {
				await this._handlePromise('update serial port', (cb) => {
					exists.update(opts, cb);
				});
				return exists;
			}
		}
		const copts: SerialPort.OpenOptions = {
			...opts,
			autoOpen: false,
			lock: true,
			rtscts: false,
			xon: true,
			xoff: true,
			xany: true,
		};

		const port: SerialPortInternalType = new SerialPort(serialDevice, copts) as any;

		const emitter = new Emitter<SerialPortCloseReason>();
		emitter.event((e) => {
			this.logService.info(`[serial port] fire event with type: SerialPortCloseReason.${SerialPortCloseReason[e]}`);
			const emitter = port._beforeClose;
			delete port._beforeClose;
			setImmediate(() => {
				emitter.dispose();
			});
		});
		Object.assign(port, {
			_beforeClose: emitter,
			beforeClose: emitter.event,
		});

		port.on('close', () => {
			this.logService.info('[serial port] ' + serialDevice + ' is end!');
			port.removeAllListeners();
			this.openedPorts.delete(serialDevice);
			if (port._beforeClose) {
				port._beforeClose.fire(SerialPortCloseReason.Unknown);
			}
		});
		this.openedPorts.set(serialDevice, port);

		await this._handlePromise(`open device {${serialDevice}}`, (cb) => {
			port.open(cb);
		});

		await this._handlePromise('get current settings', (cb) => {
			port.get(cb);
		});

		await this._handlePromise('reset settings', (cb) => {
			port.set({
				brk: false,
				cts: false,
				dsr: false,
				dtr: false,
				rts: false,
			}, cb);
		});

		await this._handlePromise('get new settings', (cb) => {
			port.get(cb);
		});

		await this._handlePromise('drain', (cb) => {
			port.drain(cb);
		});

		return port;
	}
}

registerSingleton(ISerialPortService, SerialPortService);
