import { ISPError, ISPOperation } from 'vs/kendryte/vs/platform/serialPort/flasher/node/bufferConsts';
import { Transform } from 'stream';
import { DATA_LEN_WRITE_FLASH } from 'vs/kendryte/vs/platform/open/common/chipConst';

export interface IAnyPositionWrite {
	position: number;
	data: Buffer;
}

export class ISPFlashPacker extends Transform {
	private processed: number = 0;

	constructor(
		protected readonly baseAddress: number,
		protected readonly length: number,
		protected readonly callback: (readBytes: number) => Promise<any>,
	) {
		super({ objectMode: true });

		this.once('end', () => {
			this.destroy();
		});
	}

	public pipe<T extends NodeJS.WritableStream>(dest: T): T {
		return super.pipe<T>(dest, { end: false });
	}

	public get currentAddress() {
		return this.baseAddress + this.processed;
	}

	_transform(data: Buffer | IAnyPositionWrite, encoding: string, callback: Function) {
		let buff: Buffer;
		if (Buffer.isBuffer(data)) {
			buff = data;
		} else {
			buff = data.data;
			this.processed = data.position;
			console.log('write position: 0x%s, %s bytes', this.currentAddress.toString(16), buff.length);
		}

		if (buff.length !== DATA_LEN_WRITE_FLASH) {
			throw new TypeError('ISP Flash can only handle ' + DATA_LEN_WRITE_FLASH + 'bytes chunk data, but got ' + buff.length + '.');
		}

		const writeHeader = Buffer.allocUnsafe(8);
		writeHeader.writeUInt32LE(this.currentAddress, 0);
		writeHeader.writeUInt32LE(buff.length, 4);

		this.processed += buff.length;

		// emit
		this.push({
			op: ISPOperation.ISP_FLASH_WRITE,
			err: ISPError.ISP_RET_DEFAULT,
			buffer: Buffer.concat([writeHeader, buff]),
		});

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
