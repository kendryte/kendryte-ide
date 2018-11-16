import { QuotingBuffer, UnQuotedBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/quotedBuffer';
import { EscapeBuffer, UnEscapeBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/escapeBuffer';
import { ISPParseBuffer, ISPSerializeBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/ispBuffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { ISPError, ISPOperation, ISPRequest, ISPResponse } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { createReadStream, ReadStream } from 'fs';
import { GarbageData, StreamChain } from 'vs/kendryte/vs/workbench/serialUpload/node/streamChain';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { DeferredTPromise } from 'vs/base/test/common/utils';
import { ISPMemoryPacker } from 'vs/kendryte/vs/workbench/serialUpload/node/ispMemoryPacker';
import { addDisposableEventEmitterListener } from 'vs/kendryte/vs/base/node/disposableEvents';
import { TimeoutBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/timoutBuffer';
import { disposableStream } from 'vs/kendryte/vs/base/node/disposableStream';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { lstat } from 'vs/base/node/pfs';
import { timeout } from 'vs/base/common/async';
import { ISPFlashPacker } from 'vs/kendryte/vs/workbench/serialUpload/node/ispFlashPacker';
import { ChunkBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/chunkBuffer';
import { createCipheriv, createHash } from 'crypto';
import { drainStream } from 'vs/kendryte/vs/base/common/drainStream';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';

export enum ChipType {
	OnBoard = 0,
	InChip = 1,
}

export class SerialLoader extends Disposable {
	protected readonly streamChain: StreamChain<ISPRequest, ISPResponse>;
	protected readonly timeout: TimeoutBuffer;
	protected readonly cancel: CancellationTokenSource;
	protected readonly token: CancellationToken;

	protected aborted: Error;
	protected readonly abortedPromise: TPromise<never>;

	protected readonly applicationStream: ReadStream;
	protected applicationStreamSize: number;
	protected bootLoaderStreamSize: number;

	public get onError(): Event<Error> { return this.streamChain.onError; }

	protected readonly bootLoaderStream: ReadStream;

	private deferred: DeferredTPromise<ISPResponse>;
	private deferredWait: ISPOperation[];
	private deferredReturn: ISPError;

	constructor(
		device: SerialPortBaseBinding,
		application: string,
		bootLoader: string,
		protected readonly encryptionKey: Buffer,
		protected readonly type: ChipType,
		protected readonly logger: IChannelLogger,
	) {
		super();

		this.applicationStream = this._register(disposableStream(
			createReadStream(application, { highWaterMark: 4096 }),
		));
		this.bootLoaderStream = this._register(disposableStream(
			createReadStream(bootLoader, { highWaterMark: 1024 }),
		));

		this.timeout = this._register(new TimeoutBuffer(5));

		this.streamChain = new StreamChain([
			new ISPSerializeBuffer(),
			new EscapeBuffer(),
			new QuotingBuffer(),
			device,
			// this.timeout,
			new UnQuotedBuffer(),
			new UnEscapeBuffer(),
			new ISPParseBuffer(),
		]);

		this.timeout.disable();

		this.cancel = new CancellationTokenSource();
		this._register(this.streamChain);
		this._register(this.cancel);
		this.token = this.cancel.token;

		this._register(
			addDisposableEventEmitterListener(device, 'close', () => this.handleError(new Error('Broken pipe'))),
		);

		this.abortedPromise = new TPromise<never>((resolve, reject) => {
			this._register(this.cancel.token.onCancellationRequested(() => {
				reject(this.aborted);
			}));
			this._register({
				dispose() {
					setTimeout(() => {
						resolve(void 0); // to prevent dead promise in any way, but this is very not OK.
					}, 100);
				},
			});
		});

		this._register(this.streamChain.onGarbage(garbage => this.logGarbage(garbage)));
		this._register(this.streamChain.onError(err => this.handleError(err)));
		this._register(this.streamChain.onData(data => this.handleData(data)));
	}

	protected async writeMemoryChunks(content: ReadStream, baseAddress: number, length: number, report?: SubProgress) {
		const packedData = new ISPMemoryPacker(baseAddress, length, async (bytesProcessed: number): TPromise<void> => {
			const op = await this.expect(ISPOperation.ISP_MEMORY_WRITE);
			if (op.op === ISPOperation.ISP_DEBUG_INFO) {
				this.logger.info(op.text);
			} else if (op.op === ISPOperation.ISP_MEMORY_WRITE && op.err === ISPError.ISP_RET_OK) {
				if (report) {
					report.progress(bytesProcessed);
				}
			} else {
				throw this.ispError(op);
			}
		});
		content.pipe(packedData).pipe(this.streamChain);

		await packedData.finishPromise();
	}

	protected async writeFlashChunks(content: ReadStream, baseAddress: number, length: number, report?: SubProgress) {
		const shaSize = 32;
		const headerIsEncryptSize = 1;
		const headerDataLenSize = 4;

		const AES_MAX_LARGER_SIZE = 16;

		let contentBuffer: Buffer;
		const headerSize = headerIsEncryptSize + headerDataLenSize; // isEncrypt(1bit) + appLen(4bit) + appCode
		if (this.encryptionKey) {
			const aesType = `aes-${this.encryptionKey.length}-cbc`;
			const encrypt = createCipheriv(aesType, this.encryptionKey, Buffer.allocUnsafe(16));
			contentBuffer = await drainStream(content.pipe(encrypt), length + AES_MAX_LARGER_SIZE, headerSize, shaSize);
		} else {
			contentBuffer = await drainStream(content, length, headerSize, shaSize);
		}

		// dataStartAt = headerSize
		const dataEndAt = contentBuffer.length - shaSize;
		const dataSize = contentBuffer.length - shaSize - headerSize;

		// appendFileSync('X:/test-js.txt', '==' + length + '\n\n');

		if (this.encryptionKey) {
			contentBuffer.writeUInt8(1, 0);
		} else {
			contentBuffer.writeUInt8(0, 0);
		}
		contentBuffer.writeUInt32LE(dataSize, 1);

		createHash('sha256').update(contentBuffer.slice(0, dataEndAt)).digest()
			.copy(contentBuffer, contentBuffer.length - shaSize);

		// appendFileSync('X:/test-js.txt', '==sha256=' + createHash('sha256').update(Buffer.allocUnsafe(10)).digest().toString('hex') + '\n\n');
		// appendFileSync('X:/test-js.txt', '==' + contentBuffer.length + '\n\n');
		// writeFileSync('X:/js-buffer.txt', contentBuffer);

		const packedData = new ISPFlashPacker(baseAddress, length, async (bytesProcessed: number): TPromise<void> => {
			const op = await this.expect(ISPOperation.ISP_FLASH_WRITE);
			if (op.op === ISPOperation.ISP_FLASH_WRITE && op.err === ISPError.ISP_RET_OK) {
				if (report) {
					report.progress(bytesProcessed);
				}
			} else {
				throw this.ispError(op);
			}
		});

		const spliter = new ChunkBuffer(4096);
		spliter
			.pipe(packedData)
			.pipe(this.streamChain);

		spliter.end(contentBuffer);

		await packedData.finishPromise();
	}

	async flashBoot(address = 0x80000000) {
		this.logger.info('Boot from memory: 0x%s.', address.toString(16));
		const buff = Buffer.allocUnsafe(8);
		buff.writeUInt32LE(address, 0);
		buff.writeUInt32LE(0, 4);
		this.send(ISPOperation.ISP_MEMORY_BOOT, buff);
		this.logger.info('  boot command sent');

		const p = this.expect(ISPOperation.ISP_NOP).then(() => {
			received = true;
		}, () => {
			received = true;
		});

		let received = false;
		while (!received) {
			this.send(ISPOperation.ISP_FLASH_GREETING, Buffer.alloc(3));
			await timeout(1000);
		}

		return p;
	}

	async flashInitFlash() {
		this.logger.info('Select flash: %s', ChipType[this.type]);

		const buff = Buffer.allocUnsafe(8);
		buff.writeUInt32LE(this.type, 0);
		buff.writeUInt32LE(0, 4);

		this.send(ISPOperation.ISP_FLASH_SELECT, buff);

		await this.expect(ISPOperation.ISP_FLASH_SELECT);
		this.logger.info(' - Complete.');
	}

	async flashBootLoader(report: SubProgress) {
		const blAddress = 0x80000000;
		this.logger.info('Writing boot loader to memory (at 0x%s)', blAddress.toString(16));
		await this.writeMemoryChunks(this.bootLoaderStream, blAddress, this.bootLoaderStreamSize, report);
		this.logger.info(' - Complete.');
	}

	async flashMain(report: SubProgress) {
		this.logger.info('Downloading program to flash');
		await this.writeFlashChunks(this.applicationStream, 0, this.applicationStreamSize, report);
		this.logger.info(' - Complete.');
	}

	async flashGreeting() {
		this.logger.info('Greeting');
		this.send(ISPOperation.ISP_NOP, Buffer.alloc(3));
		await this.expect(ISPOperation.ISP_NOP);
		this.logger.info(' - Hello.');
	}

	protected logGarbage({ content, source }: GarbageData) {
		console.warn('[%s] Unexpected data: ', source, Buffer.from(content));
		if (typeof content === 'object' && !Buffer.isBuffer(content)) {
			this.logger.error('[%s] Unexpected data: %j', source, content);
		} else {
			if (source === UnQuotedBuffer['name']) {
				this.logger.write('%s', content);
			} else {
				this.logger.error('[%s] Unexpected data: %s', source, (content as any).toString('hex'));
			}
		}
	}

	protected send(op: ISPOperation, data: Buffer, raw = false) {
		this.streamChain.write({
			op,
			buffer: data,
			raw,
		});
	}

	protected expect(what: ISPOperation | ISPOperation[], ret: ISPError = ISPError.ISP_RET_OK) {
		if (this.deferred) {
			console.warn('deferred already exists: ', this.deferredWait.map(e => ISPOperation[e]));
			throw new Error('program error: expect.');
		}
		this.deferred = new DeferredTPromise<ISPResponse>();
		this.deferredWait = Array.isArray(what) ? what : [what];
		this.deferredReturn = ret;
		return this.deferred;
	}

	protected handleData(data: ISPResponse) {
		// console.log('[OUTPUT] op: %s, err: %s | %s', ISPOperation[data.op], ISPError[data.err], data.text);
		if (data.op === ISPOperation.ISP_DEBUG_INFO) {
			this.logger.log(data.text);
			return;
		}
		const deferred = this.deferred;
		delete this.deferred;
		if (deferred) {
			if (this.deferredWait && this.deferredWait.indexOf(data.op) !== -1) {
				if (this.deferredReturn === undefined || data.err === this.deferredReturn) {
					deferred.complete(data);
				} else {
					deferred.error(this.ispError(data));
				}
			} else {
				let op = ISPOperation[data.op];
				if (op === undefined) {
					op = '0x' + data.op.toString(16);
				}
				const exp = (this.deferredWait || []).map(e => ISPOperation[e]).join(', ');

				deferred.error(new Error(`Unexpected response [${op}] from chip (expect ${exp}).`));
			}
		} else {
			console.warn('not expect any data: %O', data);
			this.logger.warn('%j', data);
		}
	}

	private ispError(data: ISPResponse) {
		let message = ISPError[data.err];
		if (!message) {
			message = '0x' + (data.err as number).toString(16);
		}
		if (data.text) {
			message += ` - ${data.text}`;
		}
		return new Error(`Error from chip: ${message}`);
	}

	protected handleError(error: Error) {
		this.abort(error);
	}

	public abort(error: Error) {
		if (this.aborted) {
			return;
		}
		this.logger.info('abort operation with %s', error.message);
		this.aborted = error || new Error('Unknown Error');
		this.cancel.cancel();
	}

	protected async getSize(stream: ReadStream) {
		return (await lstat(stream.path as string)).size;
	}

	public async run(report: SubProgress) {
		const p = this._run(report);
		p.then(undefined, (err) => {
			console.warn(err.stack);
			this.logger.error(err.stack);
		});
		return p;
	}

	public async _run(report: SubProgress) {
		this.applicationStreamSize = await this.getSize(this.applicationStream);
		this.bootLoaderStreamSize = await this.getSize(this.bootLoaderStream);
		report.splitWith([
			0, // greeting
			this.bootLoaderStreamSize, // flash bootloader
			0, // boot
			0, // init
			this.applicationStreamSize,
		]);

		report.message('greeting...');
		await Promise.race<any>([this.abortedPromise, this.flashGreeting()]);
		report.next();

		report.message('flashing bootloader...');
		await Promise.race<any>([this.abortedPromise, this.flashBootLoader(report)]);
		report.next();

		report.message('booting up bootloader...');
		await Promise.race<any>([this.abortedPromise, this.flashBoot()]);
		report.next();

		report.message('flashing program init...');
		await Promise.race<any>([this.abortedPromise, this.flashInitFlash()]);
		report.next();

		report.message('flashing program...');
		await Promise.race<any>([this.abortedPromise, this.flashMain(report)]);

		this.logger.info('finished.');
	}
}