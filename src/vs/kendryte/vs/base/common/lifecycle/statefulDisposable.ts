import { Disposable, dispose, IDisposable } from 'vs/base/common/lifecycle';
import { setImmediate } from 'vs/base/common/platform';

export class StatefulDisposable implements IDisposable {
	static None = Disposable.None;

	private _toDispose: IDisposable[] = [];
	private _lifecycle_disposable_isDisposed = false;

	public dispose(): void {
		if (this._lifecycle_disposable_isDisposed) {
			const e = new Error('Disposing object that has already been disposed.');
			setImmediate(() => {
				throw e;
			});
		}
		this._lifecycle_disposable_isDisposed = true;
		this._toDispose = dispose(this._toDispose);
	}

	protected _register<T extends IDisposable>(t: T): T {
		if (this._lifecycle_disposable_isDisposed) {
			t.dispose();
			const e = new Error('Registering disposable on object that has already been disposed.');
			setImmediate(() => {
				throw e;
			});
		} else {
			this._toDispose.push(t);
		}

		return t;
	}

	/* extended */
	protected get toDispose(): IDisposable[] { return this._toDispose; }

	public get isDisposed(): boolean { return this._lifecycle_disposable_isDisposed; }
}
