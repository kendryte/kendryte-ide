import { Emitter } from 'vs/base/common/event';
import * as SerialPort from 'serialport';
import { ILogService } from 'vs/platform/log/common/log';
import { OpenOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { SerialPortInstance } from 'vs/kendryte/vs/services/serialPort/node/serialPortInstance';
import { ISerialPortManager } from 'vs/kendryte/vs/services/serialPort/common/type';
import { assign, equals } from 'vs/base/common/objects';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';

const noneEditableOptions = {
	autoOpen: false,
	lock: true,
	rtscts: false,
	xon: true,
	xoff: true,
	xany: true,
};

export class SerialPortManager implements ISerialPortManager {
	private readonly _onDispose = new Emitter<void>();
	public readonly onDispose = this._onDispose.event;

	private port?: SerialPort;
	private deviceOptions: Partial<SerialPort.OpenOptions> = {};

	private exclusiveLock: boolean = false;
	private readonly openRequestQueue: { options: OpenOptions; exclusive: boolean; dfd: DeferredPromise<SerialPortInstance> }[] = [];
	private readonly referenceStack: { options: OpenOptions; instance: SerialPortInstance; }[] = [];

	constructor(
		public readonly deviceName: string,
		protected readonly logger: ILogService,
	) {
	}

	public get $port(): SerialPortInstance {
		return this.referenceStack[0].instance;
	}

	private _handlePromise<T>(what: string, action: (cb: (e: Error, data?: T) => void) => void) {
		return new Promise<T>((resolve, reject) => {
			action((err: Error, data: T) => {
				if (err) {
					this.logger.error(`[serial port] ${what} Failed:`, err);
					reject(err);
				} else {
					this.logger.debug(`[serial port] ${what} OK:`, data);
					resolve(data);
				}
			});
		});
	}

	public openPort(options: OpenOptions, exclusive: boolean = false): Promise<SerialPortInstance> {
		this.logger.info('[serial port] open port ' + this.deviceName + ', exclusive=' + exclusive.toString());
		const dfd = new DeferredPromise<SerialPortInstance>();
		this.openRequestQueue.push({ options, exclusive, dfd });
		if (!this.exclusiveLock) {
			this.logger.info('[serial port] not exclusive locked by others, open port now!');
			this.openNext();
		}
		return dfd.p;
	}

	private openNext() {
		if (this.openRequestQueue.length === 0) {
			this.logger.info('[serial port]   no open port request in queue.');
			if (this.referenceStack.length) {
				this.logger.info('[serial port]  - resume previous open port.');
				this.resumePrev();
			} else {
				this.logger.warn('[serial port]  !! no one require this manager, self destroy');
				this.asyncDispose().catch((e) => {
					this.logger.warn('[serial port] cannot destroy manager:', e);
				});
			}
			return;
		}
		const { options, exclusive, dfd } = this.openRequestQueue.pop()!;

		const stream = new SerialPortInstance(this.deviceName, this.logger);

		const prev = this.referenceStack[0];

		this.referenceStack.unshift({ instance: stream, options });
		this.logger.info('[serial port] current instance on manager [%s]: %s', this.deviceName, this.referenceStack);

		stream.onDispose(() => {
			this.logger.info('[serial port] serial port instance disposing.');
			const index = this.referenceStack.findIndex(({ instance }) => instance === stream);
			if (index < 0) {
				debugger;
				throw new Error('impossible!');
			}
			this.referenceStack.splice(index, 1);
			if (index === 0) {
				this.exclusiveLock = false;
				this.openNext();
			}
		});
		this.exclusiveLock = exclusive;

		stream.onUpdateRequest(async (opts) => {
			this.logger.info('[serial port] serial port instance updating.');
			const index = this.referenceStack.findIndex(({ instance }) => instance === stream);
			if (index < 0) {
				debugger;
				throw new Error('impossible!');
			}
			const newOpts = assign(this.referenceStack[index].options, opts);
			if (index === 0) {
				await stream.logicClose();
				const port = await this.connectOrUpdateSerialPort(newOpts);
				await stream.logicOpen(port);
			}
		});

		const ps = prev ? prev.instance.logicClose() : Promise.resolve();
		ps.then(() => {
			return this.connectOrUpdateSerialPort(options);
		}).then((port) => {
			stream.logicOpen(port);
		}).then(() => {
			dfd.complete(stream);
		}, (e) => {
			dfd.error(e);
		});
	}

	private resumePrev() {
		const { options, instance } = this.referenceStack[0];
		this.connectOrUpdateSerialPort(options).then((port) => {
			return instance.logicOpen(port);
		}).catch((e) => {
			this.logger.error('[serial port] cannot re-open prev port:', e);
		});
	}

	protected flushAll(): Promise<void> {
		this.logger.info('do flush.');
		return Promise.all([
			this._handlePromise('flush buffer', (cb) => this.port!.flush(cb)),
			this._handlePromise('drain buffer', (cb) => this.port!.drain(cb)),
		]).then(() => {
		});
	}

	private async connectOrUpdateSerialPort(options: OpenOptions) {
		this.logger.info('[serial port] open port ' + this.deviceName + ':' + JSON.stringify(options));
		if (this.port) {
			const port = this.port;

			const { baudRate: newBr, ...newOther } = options;
			const { baudRate: oldBr, ...oldOther } = this.deviceOptions;
			if (equals(newOther, oldOther)) {
				if (newBr === oldBr) {
					this.logger.info('[serial port]   nothing changed, using old.');
				} else {
					this.logger.info('[serial port]   only baudrate changed, updating.');
					this.deviceOptions.baudRate = newBr;
					await this.flushAll();
					await this._handlePromise('change baudrate', (cb) => port.update({ baudRate: newBr }, cb));
				}
			} else {
				this.logger.info('[serial port]   options has changed, will disconnect and reconnect.');
				await this.realDisconnect();
				await this.realConnect(options);
			}
		} else {
			this.logger.info('[serial port]   new connection.');
			await this.realConnect(options);
		}
		return this.port!;
	}

	private async realConnect(deviceOptions: OpenOptions) {
		this.deviceOptions = assign({}, deviceOptions);
		const _deviceOptions = assign({}, deviceOptions, noneEditableOptions);
		const port = this.port = new SerialPort(this.deviceName, _deviceOptions);

		port.on('close', () => {
			this.logger.info('[serial port] ' + this.deviceName + ' is end!');
			this.asyncDispose().catch((e) => {
				this.logger.error('Cannot close port: %s', e);
			});
		});

		port.on('error', (e: Error) => {
			this.logger.error('[serial port] ' + this.deviceName + ' is error!', e);
		});

		await this._handlePromise(`open device {${this.deviceName}}`, (cb) => port.open(cb));
		await this._handlePromise('get current settings', (cb) => port.get(cb));
		await this._handlePromise('reset settings', (cb) => {
			port.set({
				brk: false,
				cts: false,
				dsr: false,
				dtr: false,
				rts: false,
			}, cb);
		});

		await this._handlePromise('get new settings', (cb) => port.get(cb)); // to ensure it works
	}

	private async realDisconnect() {
		if (!this.port) {
			return;
		}
		const port = this.port;
		await this.flushAll();
		delete this.port;
		await this._handlePromise('close port', (cb) => port.close(cb));
	}

	async closePort(stream: SerialPortInstance) {
		const index = this.referenceStack.findIndex(({ instance }) => instance === stream);
		if (index === -1) {
			debugger;
			throw new Error('Unknown port instance');
		}
		await stream.asyncDispose();
	}

	public connect() {
		if (this.port) {
			return Promise.resolve();
		}
		return this.realConnect({});
	}

	async asyncDispose() {
		this._onDispose.fire();
		await this.realDisconnect();
		for (const { instance } of this.referenceStack) {
			await instance.asyncDispose().catch((e) => {
				this.logger.warn('[serial port] dispose failed:', e);
			});
		}
		this.referenceStack.length = 0;

		for (const { dfd } of this.openRequestQueue) {
			dfd.error(new Error('serial port disposed'));
		}
		this._onDispose.dispose();
	}
}
