import { Emitter } from 'vs/base/common/event';
import { ISerialPortInstance } from 'vs/kendryte/vs/services/serialPort/common/type';
import * as SerialPort from 'serialport';
import { ILogService } from 'vs/platform/log/common/log';
import { Duplex } from 'stream';
import { OpenOptions, SetOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';

type CallbackFunction = (err?: Error) => void;

export class SerialPortInstance extends Duplex implements ISerialPortInstance {
	private readonly _onLogicalClose = new Emitter<void>();
	public readonly onLogicalClose = this._onLogicalClose.event;

	private readonly _onLogicalOpen = new Emitter<void>();
	public readonly onLogicalOpen = this._onLogicalOpen.event;

	private readonly _onUpdateRequest = new Emitter<OpenOptions>();
	public readonly onUpdateRequest = this._onUpdateRequest.event;

	private readonly _onDispose = new Emitter<void>();
	public readonly onDispose = this._onDispose.event;

	private waitPort: DeferredPromise<SerialPort>;

	constructor(
		public readonly deviceName: string,
		private readonly logger: ILogService,
	) {
		super();

		this._dataHandler = this._dataHandler.bind(this);
		this._readableHandler = this._readableHandler.bind(this);
		this._errorHandler = this._errorHandler.bind(this);

		this.waitPort = new DeferredPromise();
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

	private _dataHandler(data: Buffer) {
		this.push(data);
	}

	private _readableHandler() {
		this.emit('readable');
		this.waitPort.p.then((port) => {
			port.read();
		});
	}

	private _errorHandler(e: Error) {
		this.emit('error', e);
	}

	_read() { // PUSH: consumer want to read, will trigger readable soon
		this.waitPort.p.then((port) => {
			port.read();
		});
	}

	_write(chunk: Buffer, encoding: string, callback: CallbackFunction) {
		this.waitPort.p.then((port) => {
			port.write(chunk, encoding as any, callback);
		}, callback);
	}

	_final(callback: CallbackFunction) {
		return this.waitPort.p.then((port: SerialPort) => {
			return this.flushAll(port);
		}).then(() => {
			callback();
		}, callback);
	}

	public dispose(): void {
		this.asyncDispose().catch((e) => {
			this.logger.error('sync dispose error:', e);
		});
	}

	async asyncDispose() {
		await this.logicClose().catch(() => {
			this.logger.warn('[serial port] cannot close port, it may already closed');
		});

		if (!this.waitPort.resolved) {
			this.waitPort.error(new Error('serial port disposed'));
		}

		this._onDispose.fire();

		this._onLogicalClose.dispose();
		this._onLogicalOpen.dispose();
		this._onUpdateRequest.dispose();
		this._onDispose.dispose();

		this.destroy();
	}

	async setOptions(newOpts: OpenOptions) {
		if (this.waitPort.resolved) {
			const port = await this.waitPort.p;
			this.waitPort = new DeferredPromise();

			this._unlinkPort(port);
			await this.flushAll(port);
		}
		this._onUpdateRequest.fire(newOpts);
		await this.waitPort.p; // manager will call this.logicOpen soon
	}

	public flush() {
		return this.waitPort.p.then((port) => {
			return this.flushAll(port);
		});
	}

	protected flushAll(port: SerialPort): Promise<void> {
		return Promise.all([
			this._handlePromise('flush buffer', (cb) => port.flush(cb)),
			this._handlePromise('drain buffer', (cb) => port.drain(cb)),
		]).then(() => {
		});
	}

	private _unlinkPort(port: SerialPort) {
		port.removeListener('data', this._dataHandler);
		port.removeListener('readable', this._readableHandler);
		port.removeListener('error', this._errorHandler);

		port.pause();
	}

	async logicClose() {
		this.logger.info('[serial port] logic close.');
		if (this.waitPort.resolved) {
			const port = await this.waitPort.p;
			this.waitPort = new DeferredPromise();

			this._unlinkPort(port);

			await this.flushAll(port).catch(() => {
				this.logger.warn('[serial port] port cannot flush, maybe already closed');
			});
			this._onLogicalClose.fire();
		}
	}

	logicOpen(port: SerialPort) {
		this.logger.info('[serial port] logic open.');
		if (this.waitPort.resolved) {
			throw new Error('Cannot re-open serial port');
		}

		port.on('data', this._dataHandler);
		port.on('readable', this._readableHandler);
		port.on('error', this._errorHandler);
		this.waitPort.complete(port);
		this._onLogicalOpen.fire();

		port.resume();
	}

	public flowControl(value: SetOptions) {
		return this.waitPort.p.then((port) => {
			return this._handlePromise<void>('send flow control', (cb) => {
				port.set(value, cb);
			});
		});
	}

	public async setBaudrate(newBr: number) {
		/*const port: SerialPort = await this.waitPort.p;
		port.pause();
		await this.flushAll(port);
		await this._handlePromise('update baudrate', cb => port.update({ baudRate: newBr }, cb));
		port.resume();*/
		return this.setOptions({ baudRate: newBr });
	}
}
