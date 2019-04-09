import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { garbageEvent } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { Emitter } from 'vs/base/common/event';
import { addDisposableEventEmitterListener } from 'vs/kendryte/vs/base/node/disposableEvents';

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
	public readonly onError = this._onError.event;

	private readonly _onGarbage = new Emitter<GarbageData>();
	public readonly onGarbage = this._onGarbage.event;

	private readonly _onData: Emitter<OT> = new Emitter<OT>();
	public readonly onData = this._onData.event;

	protected readonly _lastChild: NodeJS.ReadWriteStream;

	constructor(
		protected streams: NodeJS.ReadWriteStream[],
	) {
		super();

		let prev: NodeJS.ReadWriteStream;
		streams.forEach((parser) => {
			if (prev) {
				prev.pipe(parser);
				this._register(toDisposable(() => {
					prev.unpipe(parser);
				}));
			}
			this._register(
				addDisposableEventEmitterListener(parser, garbageEvent, (data: Buffer | string) => {
					this._onGarbage.fire({
						content: data,
						source: parser.constructor['name'],
					});
				}),
			);
			this._register(
				addDisposableEventEmitterListener(parser, 'error', (err: Error) => {
					debugger;
					this._onError.fire(err);
				}),
			);
			prev = parser;
		});
		this._lastChild = streams[streams.length - 1];

		this._register(
			addDisposableEventEmitterListener(this._lastChild, 'data', (data: OT) => this._onData.fire(data)),
		);

		this._register(this._onError);
		this._register(this._onGarbage);
		this._register(this._onData);

		this._register({
			dispose: () => overrideAllMethod(this),
		});
	}

	write(data: IT | Buffer | string) {
		return this.streams[0].write(data as any, 'binary');
	}

	public get writable() {
		return this.streams[0].writable;
	}

	public abort(reason?: any): Promise<void> {
		return Promise.resolve();
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

	public off(event: string | symbol, listener: (...args: any[]) => void): this {
		this._lastChild.off(event, listener);
		return this;
	}

	public rawListeners(event: string | symbol) {
		return this._lastChild.rawListeners(event);
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
