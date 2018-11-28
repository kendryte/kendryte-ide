export function timeout(ms: number): [Promise<void>, () => void] {
	let cb: () => void;
	const p = new Promise<void>((resolve, reject) => {
		const to = setTimeout(() => resolve(), ms);
		cb = () => {
			clearTimeout(to);
			reject(new Error('cancel'));
		};
	});
	return [p, cb];
}

export function always(p: Thenable<any>, cb: () => void) {
	p.then(cb, cb);
}

export type ValueCallback<T = any> = (value: T | Thenable<T>) => void;

export class DeferredPromise<T> {

	public p: Promise<T>;
	private completeCallback: ValueCallback<T>;
	private errorCallback: (err: any) => void;

	constructor() {
		this.p = new Promise<any>((c, e) => {
			this.completeCallback = c;
			this.errorCallback = e;
		});
	}

	public complete(value: T) {
		return new Promise(resolve => {
			process.nextTick(() => {
				this.completeCallback(value);
				resolve();
			});
		});
	}

	public error(err: any) {
		return new Promise(resolve => {
			process.nextTick(() => {
				this.errorCallback(err);
				resolve();
			});
		});
	}

	public cancel() {
		process.nextTick(() => {
			this.errorCallback(canceled());
		});
	}
}

const canceledName = 'Canceled';

/**
 * Returns an error that signals cancellation.
 */
function canceled(): Error {
	const error = new Error(canceledName);
	error.name = error.message;
	return error;
}
