import { IDisposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';

export interface IMyDisposable extends IDisposable {
	readonly onDispose: Event<void>;
}

export class DisposableSet<T extends IMyDisposable> implements IDisposable, Set<T> {
	public readonly [Symbol.toStringTag] = 'DisposableSet' as any;
	private readonly _set: Set<T> = new Set();

	add(value: T): this {
		value.onDispose(() => {
			this.simpleDelete(value);
		});
		this._set.add(value);
		return this;
	}

	delete(value: T): boolean {
		const exists = this.has(value);
		value.dispose();
		return exists;
	}

	private simpleDelete(value: T) {
		this._set.delete(value);
	}

	clear(): void {
		this._set.forEach((item) => item.dispose());
	}

	dispose(): void {
		this.clear();
	}

	/*// common interface */
	forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg: any = undefined) {
		this._set.forEach(callbackfn, thisArg);
	}

	has(value: T) {
		return this._set.has(value);
	}

	get size() {
		return this._set.size;
	}

	[Symbol.iterator]() {
		return this._set[Symbol.iterator]();
	}

	entries() {
		return this._set.entries();
	}

	keys() {
		return this._set.keys();
	}

	values() {
		return this._set.values();
	}
}
