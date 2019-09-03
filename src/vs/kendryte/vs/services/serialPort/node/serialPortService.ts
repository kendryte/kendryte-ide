import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as SerialPort from 'serialport';
import { Emitter, Event } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { ISerialPortInstance, ISerialPortManager, ISerialPortService, ISerialRebootSequence, SerialPortItem } from 'vs/kendryte/vs/services/serialPort/common/type';
import { array_has_diff_cb } from 'vs/kendryte/vs/base/common/utils';
import { timeout } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IQuickInputService, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { CONFIG_KEY_FILTER_EMPTY_DEVICES } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { SerialPortManager } from 'vs/kendryte/vs/services/serialPort/node/serialPortManager';
import { SerialPortInstance } from 'vs/kendryte/vs/services/serialPort/node/serialPortInstance';

const SELECT_STORAGE_KEY = 'serial-port.last-selected';

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
	private serialPorts = new ExtendMap<string, SerialPortManager>();

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
		this.refreshDevices().catch();
		lifecycleService.onWillShutdown(async () => {
			for (const port of Array.from<SerialPortManager>(this.serialPorts.values())) {
				await this.destroyPortManager(port).then(undefined, (e: Error) => {
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

	private _toDeviceObject(p: string | ISerialPortManager | ISerialPortInstance): SerialPortManager | void {
		if (typeof p === 'string') {
			return this.serialPorts.get(p);
		} else if (p instanceof SerialPortInstance) {
			return this.serialPorts.get(p.deviceName);
		} else {
			return p as SerialPortManager;
		}
	}

	public async sendFlowControl(port: string | ISerialPortManager | ISerialPortInstance, controlSeq: ISerialRebootSequence, cancel?: CancellationToken) {
		const mgr = this._toDeviceObject(port);
		if (!mgr) {
			throw new Error('Cannot find opened port.');
		}

		if (cancel) {
			cancel.onCancellationRequested(() => {
				mgr.$port.flowControl({ dtr: false, rts: false }).catch();
			});
		}

		for (const state of controlSeq) {
			if (cancel && cancel.isCancellationRequested) {
				return;
			}
			this.logService.debug('set port state:', state);
			await mgr.$port.flowControl(state);
			await timeout(10, cancel || CancellationToken.None);
		}
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

	public getPortManager(serialDevice: string): SerialPortManager {
		return this.serialPorts.entry(serialDevice, () => {
			const pm = new SerialPortManager(serialDevice, this.logService);
			pm.onDispose(() => {
				this.serialPorts.delete(serialDevice);
			});
			return pm;
		});
	}

	public async destroyPortManager(port: string | ISerialPortManager): Promise<void> {
		const serialDevice = this._toDeviceObject(port);
		if (!serialDevice) {
			return Promise.resolve(void 0);
		}

		await serialDevice.asyncDispose();
	}
}

registerSingleton(ISerialPortService, SerialPortService);
