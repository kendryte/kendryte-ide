import { Transform } from 'stream';
import { setImmediate } from 'vs/base/common/platform';

export class FourBytesReverser extends Transform {
	private readonly buffer: Buffer;
	private lastLength: number;

	constructor() {
		super();
		this.buffer = Buffer.alloc(4, 0);
		this.lastLength = 0;
	}

	_transform(chunk: Buffer, encoding: string, callback: Function): void {
		const fullChunk: Buffer = this.lastLength === 0 ? chunk : Buffer.concat([this.buffer, chunk]);

		const nextLength = fullChunk.length % 4;
		const matchLength = fullChunk.length - nextLength;

		this.push(fullChunk.slice(0, matchLength).swap32(), encoding);

		if (nextLength !== 0) {
			this.buffer.fill(0);
			fullChunk.slice(matchLength).copy(this.buffer);
		}
		this.lastLength = nextLength;

		callback();
	}

	_flush(callback: Function): void {
		if (this.lastLength > 0) {
			this.push(this.buffer.swap32());
		}
		callback();
		setImmediate(() => {
			this.destroy();
		});
	}
}
