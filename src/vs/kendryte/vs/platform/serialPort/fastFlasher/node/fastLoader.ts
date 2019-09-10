import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ISerialPortInstance, ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CancellationToken } from 'vs/base/common/cancellation';
import { boardRebootSequence, BOOT_BOARD_TYPE, getSerialPortNormalState } from 'vs/kendryte/vs/services/serialPort/common/rebootSequence';
import { ReadStream } from 'fs';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { addDisposableEventEmitterListener } from 'vs/kendryte/vs/base/node/disposableEvents';
import * as split2 from 'split2';
import { stringifyMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { SpeedMeter } from 'vs/kendryte/vs/base/common/speedShow';
import { lstat } from 'vs/base/node/pfs';
import { DATA_LEN_WRITE_FLASH } from 'vs/kendryte/vs/platform/open/common/chipConst';
import { eachChunkPaddingWithSize, IBufferChunk } from 'vs/kendryte/vs/platform/serialPort/flasher/node/chunkBuffer';
import { msleep, timeout } from 'vs/kendryte/vs/base/common/timeout';
import { ResponseHello, responseIsHello, responseIsWriteOk, ResponseWriteOk } from 'vs/kendryte/vs/platform/serialPort/fastFlasher/node/response';
import { SimpleWorkerPool } from 'vs/kendryte/vs/base/common/workerPool';
import { canceled, disposed } from 'vs/base/common/errors';
import { tryRebootDevBoard } from 'vs/kendryte/vs/platform/serialPort/flashCommon/node/tryReboot';
import { localize } from 'vs/nls';
import { Event } from 'vs/base/common/event';
import { flashDataBufferPackFastLoader } from 'vs/kendryte/vs/platform/serialPort/flashCommon/node/dataBufferPack';
import { SerialReduceStream } from 'vs/kendryte/vs/platform/serialPort/fastFlasher/node/serialReduceStream';
import { flashProgramBufferPack } from 'vs/kendryte/vs/platform/serialPort/flashCommon/node/programBufferPack';
import { sha256 } from 'vs/kendryte/vs/base/node/hash';
import toPromise = Event.toPromise;

export class FastLoader extends Disposable {
	private waitHello: DeferredPromise<string>;
	private waitWriteOk = new Map<number, DeferredPromise<ResponseWriteOk>>();

	private readonly aborted: DeferredPromise<never>;

	constructor(
		protected readonly instantiationService: IInstantiationService, // DEBUG USE
		private readonly serialPortService: ISerialPortService,
		private readonly device: ISerialPortInstance,
		private readonly logger: IChannelLogger,
		private readonly cancelToken: CancellationToken,
		protected readonly developmentMode: boolean,
	) {
		super();

		const inputReduce = new SerialReduceStream(3);
		const inputSplit = inputReduce.pipe(split2(/\n/));

		this._register(
			addDisposableEventEmitterListener(device, 'close', () => this.handleError(new Error('Broken pipe'))),
		);

		this._register(
			addDisposableEventEmitterListener(inputSplit, 'data', (data: Buffer, charset: string) => this.handleData(data.toString(charset))),
		);

		this.aborted = this._register(new DeferredPromise<never>());
		this._register(cancelToken.onCancellationRequested(() => {
			this.logger.info('cancelToken.onCancellationRequested trigger.');
			this.aborted.error(canceled());
		}));

		device.pipe(inputReduce);
		device.resume();

		this._register({
			dispose: () => {
				device.unpipe(inputReduce);
				inputReduce.destroy();
				inputSplit.destroy();
				if (this.waitHello) {
					this.waitHello.error(disposed(this.constructor.name));
					delete this.waitHello;
				}
				if (this.waitWriteOk) {
					for (const item of this.waitWriteOk.values()) {
						item.error(disposed(this.constructor.name));
					}
					delete this.waitWriteOk;
				}
			},
		});
	}

	protected handleData(data: string) {
		this.logger.debug(' > ' + data);
		try {
			const json = JSON.parse(data) as ResponseWriteOk | ResponseHello;
			if (responseIsHello(json)) {
				if (this.waitHello) {
					this.waitHello.complete(json.hello);
					delete this.waitHello;
				}
			} else if (responseIsWriteOk(json)) {
				const item = this.waitWriteOk.get(json.address);
				if (item) {
					this.waitWriteOk.delete(json.address);
					item.complete(json);
				} else {
					this.logger.error('Not write this chunk: ' + data);
				}
			} else {
				this.logger.error('Unknown json: ' + data);
			}
		} catch (e) {
			this.logger.error('Invalid json: ' + data);
		}
	}

	protected handleError(error: Error) {
		this.abort(error);
	}

	private abort(error: Error) {
		this.logger.info('abort operation with %s', error.message);
		this.aborted.error(error || new Error('Unknown Error'));
		this.dispose();
	}

	rebootNormalMode() {
		return this.serialPortService.sendFlowControl(this.device, boardRebootSequence, this.cancelToken);
	}

	public async rebootISPMode() {
		this.waitHello = new DeferredPromise<string>();

		const ok = await tryRebootDevBoard(this.device, BOOT_BOARD_TYPE.FAST, this.cancelToken, this.serialPortService, this.logger, async () => {
			const ret = await Promise.race([
				timeout(1500),
				this.waitHello.p,
			]);
			this.logger.info(' > ' + ret);
		});

		if (!ok) {
			return false;
		}
		this.logger.info(`go to downloading state...`);
		await this.serialPortService.sendFlowControl(this.device, [getSerialPortNormalState()], this.cancelToken);
		await msleep(800);
		return true;
	}

	private async getSize(stream: ReadStream | Buffer) {
		if (stream instanceof Buffer) {
			return stream.byteLength;
		} else {
			return (await lstat(stream.path as string)).size;
		}
	}

	async flashProgram(stream: NodeJS.ReadableStream, length: number, report: SubProgress) {
		// const reverse = stream.pipe(new FourBytesReverser());
		const contentBuffer = await flashProgramBufferPack(stream, length, undefined);

		this.logger.info(`Downloading program to flash: size=${length}`);
		const speed = new SpeedMeter();
		speed.start();

		const pool = new SimpleWorkerPool<IBufferChunk>(2, (base, job, cancel) => {
			return this.doWriteChunk(job.index, job.count, job.chunk, base + job.position, speed, report, cancel);
		});
		await pool.run(0, eachChunkPaddingWithSize(contentBuffer, DATA_LEN_WRITE_FLASH), this.cancelToken);
	}

	async flashData(stream: ReadStream, baseAddress: number, reverse4Bytes: boolean, report: SubProgress) {
		const length = await this.getSize(stream);
		this.logger.info(`Downloading data to flash: size=${length}, address=${stringifyMemoryAddress(baseAddress)}, reverse4Bytes=${reverse4Bytes}`);
		const speed = new SpeedMeter();
		speed.start();

		const sourceBuffer = await flashDataBufferPackFastLoader(stream, reverse4Bytes);
		const pool = new SimpleWorkerPool<IBufferChunk>(2, (base, job, cancel) => {
			return this.doWriteChunk(job.index, job.count, job.chunk, base + job.position, speed, report, cancel);
		});
		await pool.run(baseAddress, eachChunkPaddingWithSize(sourceBuffer, DATA_LEN_WRITE_FLASH), this.cancelToken);
	}

	private maxAddress = 0;

	private async doWriteChunk(index: number, count: number, chunk: Buffer, address: number, speed: SpeedMeter, report: SubProgress, cancel: CancellationToken) {
		const writeHeader = Buffer.allocUnsafe(4);
		writeHeader.writeUInt32LE(address, 0);
		const data = Buffer.concat([writeHeader, chunk]);

		for (let retry = 0; retry < 3; retry++) {
			if (cancel.isCancellationRequested) {
				return;
			}

			try {
				this.logger.info(`${retry ? `[retry:${retry}] ` : ''}send chunk ${index} (of ${count}) at ${address}(0x${address.toString(16)}) ${data.length} bytes.`);
				const dfd = new DeferredPromise<ResponseWriteOk>();
				this.waitWriteOk.set(address, dfd);
				this.device.write(data);

				const to = timeout(2000);
				const response = await Promise.race([toPromise(cancel.onCancellationRequested), dfd.p, to]);

				if (response.hash === sha256(chunk)) {
					this.logger.info(`chunk ${index} complete ${response.hash}.`);

					this.maxAddress = Math.max(this.maxAddress, address);
					speed.setCurrent(this.maxAddress);

					report.message(localize('serial.flash.writing', 'Writing Flash @ {0}', speed.getSpeed()));
					report.progress(this.maxAddress);

					return;
				}

				this.logger.warn(`Hash mismatch of chunk ${index}:\nresp:\t${response.hash}\nwant:\t${sha256(chunk)}`);
			} catch (e) {
				this.logger.warn(`Write error of chunk ${index}: ${e.message}`);
			}
		}

		throw new Error(localize('errorFlashRetry', 'Flash failed (after 3 tries).'));
	}
}
