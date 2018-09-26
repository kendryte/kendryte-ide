import { Duplex } from 'stream';
import { Disposable } from 'vs/base/common/lifecycle';
import { garbageEvent } from 'vs/kendryte/vs/workbench/serialPort/upload/node/bufferConsts';
import { Emitter, Event } from 'vs/base/common/event';
import { addDisposableEventEmitterListener } from 'vs/kendryte/vs/platform/node/disposableEvents';

export interface GarbageData {
	content: Buffer | string;
	source: string;
}

const protoKeyOfStream: any = [
	'write',
	'abort',
	'end',
	'setMaxListeners',
	'getMaxListeners',
	'removeListener',
	'listeners',
	'removeAllListeners',
	'addListener',
	'on',
	'once',
	'emit',
	'listenerCount',
	'prependListener',
	'prependOnceListener',
	'eventNames',
];

function overrideAllMethod(obj: any) {
	for (const key of protoKeyOfStream) {
		Object.defineProperty(obj, key, {
			value() {
				throw new Error(`Cannot call ${key} on closed stream chain`);
			},
		});
	}
}

/***
 */
export class StreamChain<IT, OT> extends Disposable implements NodeJS.WritableStream {
	private readonly _onError: Emitter<Error> = new Emitter<Error>();
	public get onError(): Event<Error> { return this._onError.event; }

	private readonly _onGarbage: Emitter<GarbageData> = new Emitter<GarbageData>();
	public get onGarbage(): Event<GarbageData> { return this._onGarbage.event; }

	private readonly _onData: Emitter<OT> = new Emitter<OT>();
	public get onData(): Event<OT> { return this._onData.event; }

	protected readonly _lastChild: Duplex;

	constructor(
		protected streams: Duplex[],
	) {
		super();

		let last: Duplex;
		streams.forEach((parser) => {
			if (last) {
				last.pipe(parser);
			}
			this._register(
				addDisposableEventEmitterListener(parser, garbageEvent, (data) => {
					this._onGarbage.fire({
						content: data,
						source: parser.constructor['name'],
					});
				}),
			);
			this._register(
				addDisposableEventEmitterListener(parser, 'error', (err) => {
					debugger;
					this._onError.fire(err);
				}),
			);
			last = parser;
		});
		this._lastChild = last;

		this._register(
			addDisposableEventEmitterListener(last, 'data', (data) => this._onData.fire(data)),
		);

		this._register(this._onError);
		this._register(this._onGarbage);
		this._register(this._onData);

		this._register({
			dispose: () => overrideAllMethod(this),
		});
	}

	write(data: IT | Buffer | string) {
		return this.streams[0].write(data, 'binary');
	}

	public get writable() {
		return this.streams[0].writable;
	}

	public abort(reason?: any): Promise<void> {
		return undefined;
	}

	/* writable */

	end(chunk: any, encoding?: any, cb?: any) {
		this.streams[0].end(chunk, encoding, cb);
	}

	setMaxListeners(n: number): this {
		this._lastChild.setMaxListeners(n);
		return this;
	}

	getMaxListeners() {
		return this._lastChild.getMaxListeners();
	}

	removeListener(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.removeListener(event, listener);
		return this;
	}

	listeners(event: string | symbol): Function[] {
		return this._lastChild.listeners(event);
	}

	removeAllListeners(event: string): this {
		this._lastChild.removeAllListeners(event);
		return this;
	}

	addListener(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.addListener(event, listener);
		return this;
	}

	on(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.on(event, listener);
		return this;
	}

	once(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.once(event, listener);
		return this;
	}

	emit(event: string | symbol, ...args: any[]): boolean {
		return this.streams[0].emit(event, ...args);
	}

	listenerCount(type: string | symbol): number {
		return this._lastChild.listenerCount(type);
	}

	prependListener(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.prependListener(event, listener);
		return this;
	}

	prependOnceListener(event: string, listener: (...args: any[]) => void): this {
		this._lastChild.prependOnceListener(event, listener);
		return this;
	}

	eventNames(): Array<string | symbol> {
		return this._lastChild.eventNames();
	}
}
