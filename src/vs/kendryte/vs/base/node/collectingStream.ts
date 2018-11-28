import { Writable } from 'stream';
import { streamPromise } from 'vs/kendryte/vs/base/node/streamPromise';

export class CollectingStream extends Writable {
	private buffer = '';
	private _promise: Promise<string>;

	constructor(sourceStream?: NodeJS.ReadableStream) {
		super();
		if (sourceStream) {
			sourceStream.pipe(this);
			sourceStream.on('error', (e) => {
				this.emit('error', e);
			});
		}
	}

	_write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void {
		if (!encoding) {
			encoding = 'utf8';
		} else if (encoding === 'buffer') {
			encoding = 'utf8';
		}
		this.buffer += chunk.toString(encoding);
		callback();
	}

	getOutput() {
		return this.buffer;
	}

	promise(): Promise<string> {
		return this._promise ? this._promise : this._promise = streamPromise(this).then(() => {
			const buffer = this.buffer;
			delete this.buffer;
			return buffer;
		});
	}
}
