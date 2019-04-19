import { Disposable, IDisposable } from 'vs/base/common/lifecycle';

export class PublicDisposable extends Disposable {
	register<T extends IDisposable>(t: T): T {
		return this._register(t);
	}
}