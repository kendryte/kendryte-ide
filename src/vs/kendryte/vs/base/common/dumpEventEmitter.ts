import { EventEmitter } from 'events';

export function dumpEventEmitterEmit(ev: EventEmitter) {
	const real = ev.emit;
	ev.emit = (...args: any[]) => {
		console.log('[%s] emit:', ev.constructor.name, ...args);
		return real.apply(ev, args);
	};
}
