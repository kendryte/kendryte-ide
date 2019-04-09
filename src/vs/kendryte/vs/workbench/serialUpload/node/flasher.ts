import { QuotingBuffer, UnQuotedBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/quotedBuffer';
import { EscapeBuffer, UnEscapeBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/escapeBuffer';
import { ISPParseBuffer, ISPSerializeBuffer } from 'vs/kendryte/vs/workbench/serialUpload/node/ispBuffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { ISPError, ISPOperation, ISPRequest, ISPResponse } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { createReadStream, ReadStream } from 'fs';
import { GarbageData, StreamChain } from 'vs/kendryte/vs/workbench/serialUpload/node/streamChain';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { DeferredPromise } from 'vs/base/test/common/utils';
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
import { ISerialPortService, SerialPortBaseBinding } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { throwNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { CHIP_BAUDRATE, PROGRAM_BASE } from 'vs/kendryte/vs/workbench/serialUpload/common/chipDefine';
import { memoize } from 'vs/base/common/decorators';

export enum FlashTargetType {
	OnBoard = 0,
	InChip = 1,
}

export class SerialLoader extends Disposable {
	protected readonly streamChain: StreamChain<ISPRequest, ISPResponse>;
	protected readonly timeout: TimeoutBuffer;
	protected readonly cancel: CancellationTokenSource;
	protected readonly token: CancellationToken;

	private _application: string | undefined;
	private _bootLoader: string | undefined;
	private _baudRate: number = CHIP_BAUDRATE;
	private _encryptionKey: Buffer | undefined;
	private _targetType: FlashTargetType;

	protected aborted: Error;
	public readonly abortedPromise: Promise<never>;

	protected applicationStreamSize: number;
	protected bootLoaderStreamSize: number;

	public get onError(): Event<Error> { return this.streamChain.onError; }

	private deferred: DeferredPromise<ISPResponse>;
	private deferredWait: ISPOperation[];
	private deferredReturn: ISPError;

	constructor(
		private readonly serialPortService: ISerialPortService,
		private readonly device: SerialPortBaseBinding,
		protected readonly logger: IChannelLogger,
	) {
		super();

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

		this.abortedPromise = new Promise<never>((resolve, reject) => {
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

	public setFlashTarget(target: FlashTargetType) {
		this._targetType = target;
	}

	public setBootLoader(loader: string) {
		this._bootLoader = loader;
	}

	public setProgram(application: string, encryptionKey?: Buffer) {
		this._application = application;
		this._encryptionKey = encryptionKey;
	}

	public setBaudRate(br: number) {
		this._baudRate = br;
	}

	@memoize
	protected get bootLoaderStream(): ReadStream {
		return this._register(disposableStream(
			createReadStream(throwNull(this._bootLoader), { highWaterMark: 1024 }),
		));
	}

	@memoize
	protected get applicationStream(): ReadStream {
		return this._register(disposableStream(
			createReadStream(throwNull(this._application), { highWaterMark: 4096 }),
		));
	}

	protected async writeMemoryChunks(content: ReadStream, baseAddress: number, length: number, report?: SubProgress) {
		const packedData = new ISPMemoryPacker(baseAddress, length, async (bytesProcessed: number): Promise<void> => {
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
		if (this._encryptionKey) {
			const aesType = `aes-${this._encryptionKey.length}-cbc`;
			const encrypt = createCipheriv(aesType, this._encryptionKey, Buffer.allocUnsafe(16));
			contentBuffer = await drainStream(content.pipe(encrypt), length + AES_MAX_LARGER_SIZE, headerSize, shaSize);
		} else {
			contentBuffer = await drainStream(content, length, headerSize, shaSize);
		}

		// dataStartAt = headerSize
		const dataEndAt = contentBuffer.length - shaSize;
		const dataSize = contentBuffer.length - shaSize - headerSize;

		// appendFileSync('X:/test-js.txt', '==' + length + '\n\n');

		if (this._encryptionKey) {
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

		const packedData = new ISPFlashPacker(baseAddress, length, async (bytesProcessed: number): Promise<void> => {
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

	private async flashBootGreeting() {
		let received = false;

		const p = this.expect(ISPOperation.ISP_NOP).finally(() => {
			received = true;
		});

		let i = 0;
		while (!received) {
			this.logger.info(' - Greeting %s.', ++i);
			this.send(ISPOperation.ISP_FLASH_GREETING, Buffer.alloc(3));
			await timeout(300);

			if (i === 20) {
				throw new Error('ISP application no response.');
			}
		}

		return p.then(() => {
			this.logger.info('   - got hello.');
		}, (e) => {
			this.logger.error('   - no hello:' + (e ? e.message || e : 'no message'));
		});
	}

	async executeProgram(address = PROGRAM_BASE) {
		this.logger.info('Boot from memory: 0x%s.', address.toString(16));
		const buff = Buffer.allocUnsafe(8);
		buff.writeUInt32LE(address, 0);
		buff.writeUInt32LE(0, 4);
		this.send(ISPOperation.ISP_MEMORY_BOOT, buff);
		this.logger.info('  boot command sent');

		await this.flashBootGreeting();
	}

	async selectFlashTarget() {
		this.logger.info('Select flash: %s', FlashTargetType[this._targetType]);

		const buff = Buffer.allocUnsafe(8);
		buff.writeUInt32LE(this._targetType, 0);
		buff.writeUInt32LE(0, 4);

		this.send(ISPOperation.ISP_FLASH_SELECT, buff);

		await this.expect(ISPOperation.ISP_FLASH_SELECT);
		this.logger.info(' - Complete.');
	}

	async flashBootLoader(report: SubProgress) {
		this.logger.info('Writing boot loader to memory (at 0x%s)', PROGRAM_BASE.toString(16));
		await this.writeMemoryChunks(this.bootLoaderStream, PROGRAM_BASE, this.bootLoaderStreamSize, report);
		this.logger.info(' - Complete.');
	}

	async changeBaudRate(br = this._baudRate) {
		this.logger.info('Change baud rate to ', br);

		const buff = Buffer.allocUnsafe(12);
		buff.writeUInt32LE(0, 0);
		buff.writeUInt32LE(4, 4);
		buff.writeUInt32LE(br, 8);

		await this.send(ISPOperation.ISP_DEBUG_CHANGE_BAUD_RATE, buff);

		await this.flashBootGreeting();

		this.logger.info(' - Complete.');
	}

	async flashMainProgram(report: SubProgress) {
		this.logger.info('Downloading program to flash');
		await this.writeFlashChunks(this.applicationStream, 0, this.applicationStreamSize, report);
		this.logger.info(' - Complete.');
	}

	rebootNormalMode() {
		return this.serialPortService.sendReboot(this.device);
	}

	async rebootISPMode() {
		this.logger.info('Greeting');
		try {
			this.logger.info('try reboot as KD233');
			await this.serialPortService.sendRebootISPKD233(this.device);
			this.send(ISPOperation.ISP_NOP, Buffer.alloc(3));
			await this.setTimeout('greeting kd233 board', 1000, this.expect(ISPOperation.ISP_NOP));
			this.logger.info(' - Hello.');
			return;
		} catch (e) {
			this.logger.info('Failed to boot as KD233: %s', e.message);
		}
		try {
			this.logger.info('try reboot as other board');
			await this.serialPortService.sendRebootISPDan(this.device);
			this.send(ISPOperation.ISP_NOP, Buffer.alloc(3));
			await this.setTimeout('greeting other board', 1000, this.expect(ISPOperation.ISP_NOP));
			this.logger.info(' - Hello.');
			return;
		} catch (e) {
			this.logger.info('Failed to boot as other board: %s', e.message);
			throw e;
		}
	}

	protected logGarbage({ content, source }: GarbageData) {
		if (typeof content === 'object' && !Buffer.isBuffer(content)) {
			console.warn('[%s] Unexpected data: ', source, Buffer.from(content));
			this.logger.error('[%s] Unexpected data: %j', source, content);
		} else {
			console.warn('[%s] Unexpected data: ', source, content);
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

	protected setTimeout(what: string, ms: number, promise: Promise<any>) {
		const to = setTimeout(() => {
			console.error('timeout');
			deferred.error(new Error('Timeout ' + what)).catch();
		}, ms);
		console.log('timeout %s registered', to);
		const deferred = this.deferred;
		return promise.then(() => {
			console.log('timeout %s cancel(success)', to);
			clearTimeout(to);
		}, (e) => {
			console.log('timeout %s cancel(reject %s)', to, e.message);
			clearTimeout(to);
			throw e;
		});
	}

	protected expect(what: ISPOperation | ISPOperation[], ret: ISPError = ISPError.ISP_RET_OK): Promise<any> {
		if (this.deferred) {
			console.warn('deferred already exists: ', this.deferredWait.map(e => ISPOperation[e]));
			throw new Error('program error: expect.');
		}
		const self = this.deferred = new DeferredPromise<ISPResponse>();
		this.deferredWait = Array.isArray(what) ? what : [what];
		this.deferredReturn = ret;
		this.deferred.p.catch(() => {
			if (this.deferred === self) {
				delete this.deferred;
			}
		});
		return this.deferred.p;
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
					deferred.complete(data).catch();
				} else {
					deferred.error(this.ispError(data)).catch();
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
		p.catch((err) => {
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
		await Promise.race<any>([this.abortedPromise, this.rebootISPMode()]);
		report.next();

		report.message('flashing bootloader...');
		await Promise.race<any>([this.abortedPromise, this.flashBootLoader(report)]);
		report.next();

		report.message('booting up bootloader...');
		await Promise.race<any>([this.abortedPromise, this.executeProgram()]);
		report.message('update baudrate...');
		if (this._baudRate !== CHIP_BAUDRATE) {
			await Promise.race<any>([this.abortedPromise, this.changeBaudRate()]);
		}
		report.next();

		report.message('flashing program init...');
		await Promise.race<any>([this.abortedPromise, this.selectFlashTarget()]);
		report.next();

		report.message('flashing program...');
		await Promise.race<any>([this.abortedPromise, this.flashMainProgram(report)]);

		report.message('reboot to run the program...');
		await Promise.race<any>([this.abortedPromise, this.rebootNormalMode()]);

		this.logger.info('finished.');
	}
}