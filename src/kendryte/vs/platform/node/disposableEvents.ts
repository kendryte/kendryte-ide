import { IDisposable } from 'vs/base/common/lifecycle';

export interface EventEmitterTyped<T, F extends Function> {
	on(event: T, listener: F): this;

	removeListener(event: T, listener: F): this;
}

export function addDisposableEventEmitterListener<T, F extends Function>(emitter: EventEmitterTyped<T, F>, name: T, callback: F): IDisposable {
	emitter.on(name, callback);
	return {
		dispose() {
			emitter.removeListener(name, callback);
		},
	};
}