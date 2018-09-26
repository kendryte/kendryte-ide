import * as SerialPort from 'serialport';
import { TPromise } from 'vs/base/common/winjs.base';
import { Emitter } from 'vs/base/common/event';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { array_has_diff } from 'vs/kendryte/vs/platform/common/utils';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IQuickInputService, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { MAIX_CONFIG_KEY_SERIAL_BAUDRATE } from 'vs/kendryte/vs/platform/common/type';
import { ISerialPortService, SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';

export const KEYBINDING_CONTEXT_SERIAL_TERMINAL_FOCUS = new RawContextKey<boolean>('terminalFocus', undefined);

class SerialPortService implements ISerialPortService {
	_serviceBrand: any;
	private devicesListChange = new Emitter<string[]>();

	private memSerialDeviceNames: string[];
	private memSerialDevices: SerialPortItem[];

	private cachedPromise: TPromise<void>;
	private openedPorts = new Map<string, SerialPort>();
	private lastSelected: string;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IQuickInputService protected quickInputService: IQuickInputService,
		@IConfigurationService protected configurationService: IConfigurationService,
		@ILogService protected logService: ILogService,
	) {
		this.refreshDevices();
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
		this.memSerialDevices = await SerialPort.list();
		Object.freeze(this.memSerialDevices);
		this.logService.info('COM device list: ', this.memSerialDevices);

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

	public async quickOpenDevice(): TPromise<string> {
		const devices = await this.getDevices();

		const pickMap = devices.map((item): IQuickPickItem => {
			/*{
				"manufacturer": "Arduino LLC",
				"pnpId": "usb-Arduino_LLC_Arduino_Micro-if00",
				"vendorId": "2341",
				"productId": "8037",
				"comName": "/dev/ttyACM1"
			}*/
			return {
				id: item.comName,
				label: item.manufacturer ? `${item.comName}: ${item.manufacturer}` : item.comName,
				description: item.serialNumber || item.productId,
				detail: item.pnpId,
				picked: item.comName === this.lastSelected,
			};
		});

		const picked = await this.quickInputService.pick(TPromise.as(pickMap), { canPickMany: false });
		if (picked && picked.id) {
			return this.lastSelected = picked.id;
		}
		return void 0;
	}

	public openPort(serialDevice: string, opts: Partial<SerialPort.OpenOptions> = {}, exclusive = false): TPromise<SerialPort> {
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
		const br = parseInt(this.configurationService.getValue(MAIX_CONFIG_KEY_SERIAL_BAUDRATE)) || 115200;
		opts = {
			lock: false,
			...opts,
			autoOpen: false,
			baudRate: br,
		};
		const port = new SerialPort(serialDevice, opts);
		console.log('open serial port with args: %o', opts);
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

registerSingleton(ISerialPortService, SerialPortService);
