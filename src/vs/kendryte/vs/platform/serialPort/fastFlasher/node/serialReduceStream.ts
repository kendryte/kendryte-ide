import { Transform } from 'stream';

export class SerialReduceStream extends Transform {
	private lastChar: number = -1;
	private lastCharCount: number = 0;

	constructor(private readonly repeat: number) {
		super();
	}

	_transform(chunk: Buffer, encoding: string, callback: (error?: Error, data?: any) => void): void {
		try {
			for (const i of chunk) {
				if (this.lastChar === i) {
					this.lastCharCount++;
					if (this.lastCharCount > this.repeat) {
						this.em(i);
					}
				} else {
					this.em(i);
				}
			}
		} catch (e) {
			return callback(e);
		}
		callback();
	}

	private em(char: number) {
		this.lastChar = char;
		this.push(Buffer.alloc(1, char));
		this.lastCharCount = 1;
	}
}
