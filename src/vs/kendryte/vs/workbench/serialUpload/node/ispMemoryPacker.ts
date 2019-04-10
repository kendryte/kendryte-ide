import { ISPError, ISPOperation } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { Transform } from 'stream';
import { DATA_LEN_WRITE_MEMORTY } from 'vs/kendryte/vs/platform/open/common/chipConst';

export class ISPMemoryPacker extends Transform {
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
		if (data.length > DATA_LEN_WRITE_MEMORTY) { // TODO
			throw new TypeError('ISP Memory can only handle ' + DATA_LEN_WRITE_MEMORTY + 'bytes chunk data.');
		}

		this.processed += data.length;

		const writeHeader = Buffer.allocUnsafe(8);
		writeHeader.writeUInt32LE(this._currentAddress, 0);
		writeHeader.writeUInt32LE(data.length, 4);

		// emit
		this.push({
			op: ISPOperation.ISP_MEMORY_WRITE,
			err: ISPError.ISP_RET_DEFAULT,
			buffer: Buffer.concat([writeHeader, data]),
		});

		// cursor address
		this._currentAddress += data.length;

		this.callback(this.processed).then(() => {
			callback();
			// if (this.length === this.processed) {
			// 	debugger;
			// }
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
