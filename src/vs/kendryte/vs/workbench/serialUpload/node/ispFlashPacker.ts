import { ISPError, ISPOperation } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { Transform } from 'stream';

export class ISPFlashPacker extends Transform {
	private _currentAddress: number;
	private processed: number = 0;

	constructor(
		protected readonly baseAddress: number,
		protected readonly length: number,
		protected readonly callback: (readBytes: number) => Promise<any>,
	) {
		super({ objectMode: true });
		this._currentAddress = baseAddress;

		this.once('end', () => {
			this.destroy();
		});
	}

	public pipe<T extends NodeJS.WritableStream>(dest: T): T {
		return super.pipe<T>(dest, { end: false });
	}

	public get currentAddress() {
		return this._currentAddress;
	}

	_transform(data: Buffer, encoding: string, callback: Function) {
		this.processed += data.length;

		if (data.length !== 4096) {
			throw new TypeError('ISP Flash can only handle 4kb chunk data.');
		}

		const writeHeader = Buffer.allocUnsafe(8);
		writeHeader.writeUInt32LE(this._currentAddress, 0);
		writeHeader.writeUInt32LE(data.length, 4);

		// emit
		this.push({
			op: ISPOperation.ISP_FLASH_WRITE,
			err: ISPError.ISP_RET_DEFAULT,
			buffer: Buffer.concat([writeHeader, data]),
		});

		// cursor address
		this._currentAddress += data.length;

		this.callback(this.processed).then(() => {
			callback();
			if (this.length === this.processed) {
				debugger;
			}
		}, (err) => {
			this.emit('error', err);
			this.destroy(err);
		});
	}

	public finishPromise() {
		return new Promise((resolve, reject) => {
			this.once('error', err => reject(err));
			this.once('close', () => resolve());
		});
	}
}
