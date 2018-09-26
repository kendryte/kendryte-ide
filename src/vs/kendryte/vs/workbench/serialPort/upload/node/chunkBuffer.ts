import { Transform } from 'stream';

export class ChunkBuffer extends Transform {
	private readonly buffer: Buffer;
	private currentLength = 0;

	constructor(private readonly size: number) {
		super();
		this.buffer = Buffer.alloc(size);
	}

	_transform(chunk: Buffer, encoding: string, callback: Function): void {
		if (chunk.length + this.currentLength >= this.size) {
			const remain = this.size - this.currentLength;

			chunk.copy(this.buffer, this.currentLength, 0, remain);

			this.push(Buffer.concat([
				this.buffer.slice(0, this.currentLength),
				chunk.slice(0, remain),
			]));

			let i: number;
			for (i = remain; i + this.size < chunk.length; i += this.size) {
				this.push(Buffer.from(chunk.slice(i, i + this.size)));
			}

			this.currentLength = chunk.copy(this.buffer, 0, i);
		} else {
			chunk.copy(this.buffer, this.currentLength);
			this.currentLength = chunk.length + this.currentLength;
		}
		callback();
	}

	_flush(callback: Function): void {
		if (this.currentLength > 0) {
			this.buffer.fill(0, this.currentLength);
			this.push(this.buffer.slice(0));
		}
		callback();
	}
}