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
import { flashDataBufferPack } from 'vs/kendryte/vs/platform/serialPort/flashCommon/node/dataBufferPack';
import { SimpleWorkerPool } from 'vs/kendryte/vs/base/common/workerPool';
import { canceled, disposed } from 'vs/base/common/errors';
import { createHash } from 'crypto';
import { tryRebootDevBoard } from 'vs/kendryte/vs/platform/serialPort/flashCommon/node/tryReboot';
import { localize } from 'vs/nls';

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

		const input = split2(/\n/);

		this._register(
			addDisposableEventEmitterListener(device, 'close', () => this.handleError(new Error('Broken pipe'))),
		);

		this._register(
			addDisposableEventEmitterListener(input, 'data', (data: Buffer, charset: string) => this.handleData(data.toString(charset))),
		);

		this.aborted = this._register(new DeferredPromise<never>());
		this._register(cancelToken.onCancellationRequested(() => {
			this.aborted.error(canceled());
		}));

		device.pipe(input);
		device.resume();

		this._register({
			dispose: () => {
				device.unpipe(input);
				input.destroy();
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

	private async getSize(stream: ReadStream) {
		return (await lstat(stream.path as string)).size;
	}

	async flashData(stream: ReadStream, baseAddress: number, reverse4Bytes: boolean, report: SubProgress) {
		const length = await this.getSize(stream);
		this.logger.info(`Downloading data to flash: size=${length} address=${stringifyMemoryAddress(baseAddress)}`);
		const speed = new SpeedMeter();
		speed.start();

		const sourceBuffer = await flashDataBufferPack(stream, reverse4Bytes);
		const pool = new SimpleWorkerPool<IBufferChunk>(2, (base, job, cancel) => {
			return this.doWriteChunk(job.index, job.chunk, base + job.position, cancel);
		});
		await pool.run(baseAddress, eachChunkPaddingWithSize(sourceBuffer, DATA_LEN_WRITE_FLASH), this.cancelToken);
	}

	private async doWriteChunk(index: number, chunk: Buffer, address: number, cancel: CancellationToken) {
		const writeHeader = Buffer.allocUnsafe(4);
		writeHeader.writeUInt32LE(address, 0);
		const data = Buffer.concat([writeHeader, chunk]);

		for (let retry = 0; retry < 1; retry++) {
			this.logger.info(`send chunk ${index} at 0x${address.toString(16)} (${data.length} bytes).`);
			const dfd = new DeferredPromise<ResponseWriteOk>();
			this.waitWriteOk.set(address, dfd);
			this.device.write(data);

			const response = await dfd.p;
			this.logger.info(`write complete of chunk ${index} at 0x${response.address.toString(16)}.`);

			if (response.hash === sha256(chunk)) {
				return;
			}

			this.logger.warn(`Hash mismatch of chunk ${index}\nresp:\t${response.hash}\nwant:\t${sha256(chunk)}`);
			continue;
		}

		throw new Error(localize('errorFlashRetry', 'Flash failed (after 3 tries).'));
	}
}

function sha256(data: Buffer) {
	return createHash('sha256').update(data).digest().toString('hex');
}
