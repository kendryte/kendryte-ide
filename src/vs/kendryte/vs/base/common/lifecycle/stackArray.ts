export class StackArray<T> {
	private readonly _array: T[] = [];

	constructor() {
	}

	dispose() {
		this._array.length = 0;
		Object.assign(this, {
			_array: null,
		});
	}

	removeFrame(element: T) {
		const index = this._array.indexOf(element);
		if (index === -1) {
			throw new Error('StackArray: invalid remove: not exists');
		} else if (index === 0) {
			throw new Error('StackArray: remove cannot operate top element');
		} else {
			this._array.splice(index, 1);
		}
	}

	size() {
		return this._array.length;
	}

	push(element: T) {
		return this._array.unshift(element);
	}

	pop() {
		return this._array.shift();
	}

	top() {
		return this._array[0];
	}
}

