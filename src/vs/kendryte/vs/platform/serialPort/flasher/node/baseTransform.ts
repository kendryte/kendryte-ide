import { Transform } from 'stream';

export abstract class BaseTransformStream<F, T> extends Transform {
	constructor() {
		super({ objectMode: true });
	}

	_transform(chunk: F, encoding: string, callback: Function) {
		setImmediate(() => {
			try {
				this.transform(chunk);
				callback();
			} catch (e) {
				this.emit('error', e);
			}
		});
	}

	push(chunk: T) {
		return super.push(chunk, 'binary');
	}

	protected abstract transform(chunk: F): void;
}