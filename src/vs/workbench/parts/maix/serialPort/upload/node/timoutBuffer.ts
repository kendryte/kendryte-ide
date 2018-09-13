import { Transform } from 'stream';

export class TimeoutBuffer extends Transform {
	private to: number;
	private _enabled: boolean;

	constructor(private readonly timeoutSeconds: number) {
		super({ objectMode: true });
		this.on('close', _ => this.disable());
		this.once('pipe', _ => this.enable());
	}

	_transform(chunk: Buffer, encoding: string, callback: Function): void {
		// console.log('<<< %s', chunk);
		this.reset();

		this.push(chunk, encoding);
		callback();
	}

	_destroy(err: Error, callback: Function) {
		clearTimeout(this.to);
		if (err) {
			this.emit('error', err);
		}
		super._destroy(err, callback);
	}

	dispose() {
		this._enabled = false;
		if (this.to) {
			clearTimeout(this.to);
			this.to = 0;
		}
	}

	disable() {
		// console.log('timeout timer disable');
		this.dispose();
	}

	enable() {
		// console.log('timeout timer enable');
		this.startTimeout();
	}

	get enabled() {
		return this._enabled;
	}

	private startTimeout() {
		this._enabled = true;
		if (this.to) {
			clearTimeout(this.to);
			this.to = 0;
		}
		this.to = setTimeout(() => {
			console.error('a buffer has timeout');
			this.destroy(new Error(`no data after ${this.timeoutSeconds}s`));
		}, this.timeoutSeconds * 1000);
	}

	private reset() {
		if (this._enabled) {
			this.startTimeout();
		}
	}
}
