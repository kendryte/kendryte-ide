import { QuotingBuffer, UnQuotedBuffer } from 'vs/kendryte/vs/platform/serialPort/flasher/node/quotedBuffer';
import { EscapeBuffer, UnEscapeBuffer } from 'vs/kendryte/vs/platform/serialPort/flasher/node/escapeBuffer';
import { ISPParseBuffer, ISPSerializeBuffer } from 'vs/kendryte/vs/platform/serialPort/flasher/node/ispBuffer';
import { Disposable } from 'vs/base/common/lifecycle';
import { ISPError, ISPOperation, ISPRequest, ISPResponse } from 'vs/kendryte/vs/platform/serialPort/flasher/node/bufferConsts';
import { createReadStream, ReadStream } from 'fs';
import { GarbageData, StreamChain } from 'vs/kendryte/vs/platform/serialPort/flasher/node/streamChain';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { addDisposableEventEmitterListener } from 'vs/kendryte/vs/base/node/disposableEvents';
import { TimeoutBuffer } from 'vs/kendryte/vs/platform/serialPort/flasher/node/timoutBuffer';
import { disposableStream } from 'vs/kendryte/vs/base/node/disposableStream';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { lstat } from 'vs/base/node/pfs';
import { timeout } from 'vs/base/common/async';
import { eachChunkPadding } from 'vs/kendryte/vs/platform/serialPort/flasher/node/chunkBuffer';
import { createCipheriv, createHash } from 'crypto';
import { drainStream } from 'vs/kendryte/vs/base/common/drainStream';
import { ISerialPortInstance, ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { throwNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { CHIP_BAUDRATE, PROGRAM_BASE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { memoize } from 'vs/base/common/decorators';
import { localize } from 'vs/nls';
import { SpeedMeter } from 'vs/kendryte/vs/base/common/speedShow';
import { DATA_LEN_WRITE_FLASH, DATA_LEN_WRITE_MEMORTY } from 'vs/kendryte/vs/platform/open/common/chipConst';
import { HexDumpLoggerStream } from 'vs/kendryte/vs/base/node/loggerStream';
import { stringifyMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { FourBytesReverser } from 'vs/kendryte/vs/platform/serialPort/flasher/node/fourBytesReverser';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { streamToBuffer } from 'vs/kendryte/vs/base/node/collectingStream';
import { canceled } from 'vs/base/common/errors';
import { packISPWritePackage } from 'vs/kendryte/vs/platform/serialPort/flasher/node/ispFlashPackage';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { boardRebootSequence, boardRebootSequenceISP233, boardRebootSequenceISPOther } from 'vs/kendryte/vs/services/serialPort/common/rebootSequence';

export enum FlashTargetType {
	OnBoard = 0,
	InChip = 1,
}

interface IFlashProgress {
	written: number;
}

export class SerialLoader extends Disposable {
	protected readonly streamChain: StreamChain<ISPRequest, ISPResponse>;
	protected readonly timeout: TimeoutBuffer;
	protected readonly token: CancellationToken;

	private _application: string | undefined;
	private _bootLoader: string | undefined;
	private _baudRate: number = CHIP_BAUDRATE;
	private _encryptionKey: Buffer | undefined;
	private _targetType: FlashTargetType;

	private readonly aborted: DeferredPromise<never>;
	public readonly abortedPromise: Promise<never>;

	protected applicationStreamSize: number;
	protected bootLoaderStreamSize: number;

	public get onError(): Event<Error> { return this.streamChain.onError; }

	private deferred?: DeferredPromise<ISPResponse>;
	private deferredWait?: ISPOperation[];
	private deferredReturn?: ISPError;

	constructor(
		protected readonly instantiationService: IInstantiationService, // DEBUG USE
		private readonly serialPortService: ISerialPortService,
		private readonly device: ISerialPortInstance,
		protected readonly logger: IChannelLogger,
		cancelToken: CancellationToken,
		developmentMode: boolean,
	) {
		super();
		this.token = cancelToken;

		this.timeout = this._register(new TimeoutBuffer(5));

		const inputChain = [
			new ISPSerializeBuffer(),
			new EscapeBuffer(),
			new QuotingBuffer(),
			new HexDumpLoggerStream(logger.trace.bind(logger), '[TO  DEV]'),
		];
		const outputChain = [
			this.timeout,
			new HexDumpLoggerStream(logger.trace.bind(logger), '[DEV OUT]'),
			new UnQuotedBuffer(),
			new UnEscapeBuffer(),
			new ISPParseBuffer(),
		];

		this.streamChain = new StreamChain([...inputChain, device, ...outputChain]);

		if (developmentMode) {
			this.logger.warn('This is debug mode, RW timeout is disabled.');
			this.timeout.disable();
		}

		this._register(this.streamChain);
		this._register(this.token.onCancellationRequested(() => {
			this.abort(new Error(localize('cancel', 'Cancel')));
		}));

		this._register(
			addDisposableEventEmitterListener(device, 'close', () => this.handleError(new Error('Broken pipe'))),
		);

		this.aborted = new DeferredPromise<never>();
		this.abortedPromise = this.aborted.p;
		this._register({
			dispose: () => {
				setTimeout(() => {
					this.aborted.error(new Error('disposed')); // to prevent dead promise in any way, but this is very not OK.
				}, 100);
			},
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
			createReadStream(throwNull(this._bootLoader), { highWaterMark: DATA_LEN_WRITE_MEMORTY }),
		));
	}

	@memoize
	protected get applicationStream(): ReadStream {
		return this._register(disposableStream(
			createReadStream(throwNull(this._application), { highWaterMark: DATA_LEN_WRITE_FLASH }),
		));
	}

	protected async writeMemoryChunks(content: ReadStream, baseAddress: number, length: number, report?: SubProgress) {
		const speed = new SpeedMeter();
		speed.start();

		const contentBuffer = await streamToBuffer(content, true);
		const p = this.packISPWritePackage(
			ISPOperation.ISP_MEMORY_WRITE,
			baseAddress,
			contentBuffer,
			(progress) => {
				speed.setCurrent(progress.written);
				if (report) {
					report.message(localize('serial.memory.writing', 'Writing Memory @ {0}', speed.getSpeed()));
					report.progress(progress.written);
				}
			},
		);
		await p;

		speed.complete();
		this.logger.info('  - speed: %s', speed.getSpeed());
	}

	protected async writeFlashProgramChunks(content: ReadStream, baseAddress: number, length: number, report?: SubProgress, encryption = false) {
		const shaSize = 32;
		const headerIsEncryptSize = 1;
		const headerDataLenSize = 4;

		const AES_MAX_LARGER_SIZE = 16;

		let contentBuffer: Buffer;
		const headerSize = headerIsEncryptSize + headerDataLenSize; // isEncrypt(1bit) + appLen(4bit) + appCode
		if (this._encryptionKey && encryption) {
			const aesType = `aes-${this._encryptionKey.length}-cbc`;
			const encrypt = createCipheriv(aesType, this._encryptionKey, Buffer.allocUnsafe(16));
			contentBuffer = await drainStream(content.pipe(encrypt), length + AES_MAX_LARGER_SIZE, headerSize, shaSize);
		} else {
			contentBuffer = await drainStream(content, length, headerSize, shaSize);
		}

		// dataStartAt = headerSize
		const dataEndAt = contentBuffer.length - shaSize;
		const dataSize = contentBuffer.length - shaSize - headerSize;

		if (this._encryptionKey && encryption) {
			contentBuffer.writeUInt8(1, 0);
		} else {
			contentBuffer.writeUInt8(0, 0);
		}
		contentBuffer.writeUInt32LE(dataSize, 1);

		createHash('sha256').update(contentBuffer.slice(0, dataEndAt)).digest()
			.copy(contentBuffer, contentBuffer.length - shaSize);

		const speed = new SpeedMeter();
		speed.start();

		const p = this.packISPWritePackage(
			ISPOperation.ISP_FLASH_WRITE,
			baseAddress,
			contentBuffer,
			(progress) => {
				speed.setCurrent(progress.written);
				if (report) {
					report.message(localize('serial.flash.writing', 'Writing Program @ {0}', speed.getSpeed()));
					report.progress(progress.written);
				}
			},
		);

		await p;

		speed.complete();
		this.logger.info('  - speed: %s', speed.getSpeed());
	}

	private async flashBootGreeting() {
		let received = false;

		const p = this.expect(ISPOperation.ISP_FLASH_GREETING).finally(() => {
			received = true;
		});

		let i = 0;
		while (!received) {
			this.logger.info(' - Greeting %s.', ++i);
			this.send(ISPOperation.ISP_FLASH_GREETING, Buffer.alloc(3));
			await timeout(300);
		}

		return p.then(() => {
			this.logger.info('   - got hello.');
		}, (e) => {
			this.logger.error('   - no hello:' + (e ? e.message || e : 'no message'));
			throw e;
		});
	}

	async executeBootloader(report: SubProgress) {
		await this.executeProgram(PROGRAM_BASE);

		report.message('flashing program init...');
		await Promise.race<any>([this.abortedPromise, this.selectFlashTarget()]);

		if (this._baudRate !== CHIP_BAUDRATE) {
			report.message(`update baudrate to ${this._baudRate}...`);
			await Promise.race<any>([this.abortedPromise, this.changeBaudRate()]);
		}
	}

	async executeProgram(address = PROGRAM_BASE) {
		this.logger.info('Boot from memory: 0x%s.', address.toString(16));
		const buff = Buffer.allocUnsafe(8);
		buff.writeUInt32LE(address, 0);
		buff.writeUInt32LE(0, 4);
		this.send(ISPOperation.ISP_MEMORY_BOOT, buff);
		await timeout(500);
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
		br = parseInt(br as any);

		const buff = Buffer.allocUnsafe(12);
		buff.writeUInt32LE(0, 0);
		buff.writeUInt32LE(4, 4);
		buff.writeUInt32LE(br, 8);

		/*
		await this.instantiationService.invokeFunction((access) => {
			const notify = access.get(INotificationService);
			const handle = notify.prompt(Severity.Warning, 'To be continued...', [{ label: 'do', run() {} }]);
			return new Promise((resolve, reject) => {
				handle.onDidClose(() => {
					resolve();
				});
			});
		});
		*/

		this.logger.info(' - Change connection baudrate (to: ' + br + ')...');
		this.send(ISPOperation.ISP_CHANGE_BAUD_RATE, buff);
		await this.device.flush();
		await timeout(800);
		await this.device.setBaudrate(br);
		await timeout(200);

		await this.flashBootGreeting();

		this.logger.info(' - Complete.');
	}

	async flashMainProgram(report: SubProgress) {
		this.logger.info('Downloading program to flash');
		await this.writeFlashProgramChunks(this.applicationStream, 0, this.applicationStreamSize, report);
		this.logger.info(' - Complete.');
	}

	async flashData(stream: ReadStream, address: number, reverse4Bytes: boolean, report: SubProgress) {
		const length = await this.getSize(stream);
		this.logger.info(`Downloading data to flash: size=${length} address=${stringifyMemoryAddress(address)}`);
		const speed = new SpeedMeter();
		speed.start();

		const source = reverse4Bytes ?
			stream.pipe(new FourBytesReverser()) :
			stream;
		const sourceBuffer = await streamToBuffer(source, true);

		const p = this.packISPWritePackage(
			ISPOperation.ISP_FLASH_WRITE,
			address,
			sourceBuffer,
			(progress) => {
				speed.setCurrent(progress.written);
				if (report) {
					report.message(localize('serial.flash.writing', 'Writing Flash @ {0}', speed.getSpeed()));
					report.progress(progress.written);
				}
			},
		);

		await p;

		speed.complete();
		this.logger.info('  - speed: %s', speed.getSpeed());

		this.logger.info(' - Complete.');
	}

	rebootNormalMode() {
		return this.serialPortService.sendFlowControl(this.device, boardRebootSequence, this.token);
	}

	async rebootISPMode() {
		this.logger.info('Greeting');
		try {
			this.logger.info('try reboot as KD233');
			await this.serialPortService.sendFlowControl(this.device, boardRebootSequenceISP233, this.token);
			this.send(ISPOperation.ISP_NOP, Buffer.alloc(3));
			await this.setTimeout('greeting kd233 board', 1000, this.expect(ISPOperation.ISP_NOP));
			this.logger.info(' - Hello.');
			return;
		} catch (e) {
			this.logger.info('Failed to boot as KD233: %s', e.message);
		}
		try {
			this.logger.info('try reboot as other board');
			await this.serialPortService.sendFlowControl(this.device, boardRebootSequenceISPOther, this.token);
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

	/** Not sync send, NO WAY to know send out or not */
	protected send(op: ISPOperation, data: Buffer, raw = false) {
		this.streamChain.write({
			op,
			buffer: data,
			raw,
		});
	}

	protected setTimeout(what: string, ms: number, promise: Promise<any>) {
		const deferred = this.deferred;
		if (!deferred) {
			throw new Error('must expect before set timeout');
		}
		const to = setTimeout(() => {
			if (deferred === this.deferred) {
				deferred.error(new Error('Timeout ' + what));
			}
		}, ms);
		return promise.then(() => {
			clearTimeout(to);
		}, (e) => {
			clearTimeout(to);
			throw e;
		});
	}

	protected unexpect() {
		if (!this.deferred) {
			return;
		}
		if (!this.deferred.completed) {
			this.deferred.error(new Error('Unknown error'));
		}
		delete this.deferred;
		delete this.deferredWait;
		delete this.deferredReturn;
	}

	protected expect(what: ISPOperation | ISPOperation[], ret: ISPError = ISPError.ISP_RET_OK): Promise<any> {
		if (this.deferred) {
			console.warn('deferred already exists: ', this.deferredWait!.map(e => ISPOperation[e]), ', duplicate: ', what);
			throw new Error('program error: duplicate expect.');
		}
		const self = this.deferred = new DeferredPromise<ISPResponse>();
		this.deferredWait = Array.isArray(what) ? what : [what];
		this.deferredReturn = ret;
		this.deferred.p.finally(() => {
			if (this.deferred === self) {
				this.unexpect();
			}
		});
		return this.deferred.p;
	}

	protected handleData(data: ISPResponse) {
		// console.log('[OUTPUT] op: %s, err: %s | %s', ISPOperation[data.op], ISPError[data.err], data.text);
		if (data.op === ISPOperation.ISP_DEBUG_INFO) {
			this.logger.log('ISP OUTPUT:', data.text);
			return;
		}
		const deferred = this.deferred;
		delete this.deferred;
		if (deferred) {
			if (this.deferredWait && this.deferredWait.indexOf(data.op) !== -1) {
				if (this.deferredReturn === undefined || data.err === this.deferredReturn) {
					deferred.complete(data);
				} else {
					let errStr = 'ISP return error: ';
					if (data.op) {
						errStr += 'op = 0x' + data.op.toString(16);
					} else {
						errStr += 'op = {not set}';
					}
					if (data.err) {
						errStr += ', err = 0x' + data.err.toString(16);
					} else {
						errStr += ', err = {not set}';
					}
					if (data.text) {
						errStr += ', text = 0x' + data.text;
					}
					const err = new Error(errStr);
					this.logger.error(err.message);
					this.logger.error(JSON.stringify(data));
					deferred.error(err);
				}
			} else {
				let op = ISPOperation[data.op];
				if (op === undefined) {
					if (data.op) {
						op = '0x' + data.op.toString(16);
					} else {
						op = '*invalid operation*';
					}
				}
				const exp = (this.deferredWait || []).map(e => `${ISPOperation[e]}[0x${e.toString(16)}]`).join(', ');
				const err = new Error(`Unexpected response [${op}] from chip (expect ${exp}).`);

				this.logger.error(err.message);
				this.logger.error(
					'    the output is: op=%s, err: %s | %s',
					data.op ? '0x' + data.op.toString(16) : 'nil',
					data.err ? '0x' + data.err.toString(16) : 'nil',
					data.text,
				);
				deferred.error(err);
			}
		} else {
			console.warn('not expect any data: %O', data);
			this.logger.warn('%j', data);
		}
	}

	protected handleError(error: Error) {
		this.abort(error);
	}

	private abort(error: Error) {
		this.logger.info('abort operation with %s', error.message);
		this.aborted.error(error || new Error('Unknown Error'));
	}

	protected async getSize(stream: ReadStream) {
		return (await lstat(stream.path as string)).size;
	}

	public async run(report: SubProgress) {
		const p = this._run(report);
		p.catch((err) => {
			// console.warn(err.stack);
			this.logger.error(err.stack);
		});
		return p;
	}

	async packISPWritePackage(
		operation: ISPOperation.ISP_FLASH_WRITE | ISPOperation.ISP_MEMORY_WRITE,
		baseAddress: number,
		content: Buffer,
		progressFunc: (progress: IFlashProgress) => void,
	) {
		const cancel = this.token;
		const chunkSize = operation === ISPOperation.ISP_MEMORY_WRITE ? DATA_LEN_WRITE_MEMORTY : DATA_LEN_WRITE_FLASH;
		const flashTarget = operation === ISPOperation.ISP_MEMORY_WRITE ? 'memory' : 'flash';
		let bytesWritten = 0, chunkWritten = 0;
		const totalChunk = Math.ceil(content.length / chunkSize);

		this.logger.info(
			'Writing %s with %s chunk size. total bytes = %s, chunk = %s',
			flashTarget,
			chunkSize,
			content.length,
			totalChunk,
		);

		for (const chunk of eachChunkPadding(content, chunkSize)) {
			let retry = 3;
			while (true) {
				if (cancel.isCancellationRequested) {
					throw canceled();
				}

				const p = this.setTimeout('flash ' + flashTarget, 1000, this.expect(operation, ISPError.ISP_RET_OK));

				this.send(operation, packISPWritePackage(chunk, baseAddress + bytesWritten));

				const error = await p.then(() => {
					return undefined;
				}, (e) => {
					return e;
				});
				if (error) {
					if (--retry) {
						continue;
					} else {
						throw error;
					}
				}

				chunkWritten++;
				bytesWritten += chunk.length;

				this.logger.trace('chunk [%s/%s] size [%s/%s]', chunkWritten, totalChunk, bytesWritten, content.length);

				progressFunc({ written: bytesWritten });
				break;
			}
		}
	}

	public async _run(report: SubProgress) {
		this.applicationStreamSize = await this.getSize(this.applicationStream);
		this.bootLoaderStreamSize = await this.getSize(this.bootLoaderStream);
		report.splitWith([
			-1, // greeting...
			this.bootLoaderStreamSize, // flashing bootloader...
			-1, // booting up bootloader...
			this.applicationStreamSize,
			-1, // reboot
		]);

		report.message('greeting...');
		await Promise.race<any>([this.abortedPromise, this.rebootISPMode()]);
		report.next();

		report.message('flashing bootloader...');
		await Promise.race<any>([this.abortedPromise, this.flashBootLoader(report)]);
		report.next();

		report.message('booting up bootloader...');
		await Promise.race<any>([this.abortedPromise, this.executeBootloader(report)]);
		report.next();

		report.message('flashing program...');
		await Promise.race<any>([this.abortedPromise, this.flashMainProgram(report)]);

		report.message('reboot to run the program...');
		await Promise.race<any>([this.abortedPromise, this.rebootNormalMode()]);
		report.next();

		this.logger.info('finished.');
	}
}
