import { Action } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProgress, IProgressService, IProgressStep, ProgressLocation } from 'vs/platform/progress/common/progress';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import {
	ACTION_ID_MAIX_SERIAL_BOOT,
	ACTION_ID_MAIX_SERIAL_BOOT_ISP,
	ACTION_LABEL_MAIX_SERIAL_BOOT,
	ACTION_LABEL_MAIX_SERIAL_BOOT_ISP,
} from 'vs/kendryte/vs/base/common/menu/serialPort';
import { SerialLoader } from 'vs/kendryte/vs/platform/serialPort/flasher/node/flasher';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { CHIP_BAUDRATE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';

abstract class MaixSerialRebootActionBase extends Action {
	private readonly logger: IChannelLogger;
	protected abstract readonly target: string;

	constructor(
		id: string, label: string,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@IProgressService private progressService: IProgressService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IEnvironmentService private environmentService: IEnvironmentService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	async real_run(report: IProgress<IProgressStep>, token: CancellationToken): Promise<void> {
		this.logger.clear();
		await this.serialPortService.refreshDevices();
		const sel = this.serialPortService.lastSelect || await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.getPortManager(sel).openPort({
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			baudRate: CHIP_BAUDRATE,
		}, false);
		this._register(port);
		this.logger.info('\t - OK.');

		this.logger.info('==================================');

		const loader = new SerialLoader(
			this.instantiationService,
			this.serialPortService,
			port,
			this.logger,
			token,
			!this.environmentService.isBuilt,
		);
		this._register(loader);

		this.logger.info(`Reboot to ${this.target}`);
		if (this.target === 'isp') {
			await loader.rebootISPMode();
		} else {
			await loader.rebootNormalMode();
		}

		this.logger.info(`Done.`);
	}

	async run(): Promise<void> {
		const cancel = new CancellationTokenSource();
		await this.progressService.withProgress(
			{
				location: ProgressLocation.Notification,
				title: `Flash program`,
				total: 100,
				cancellable: true,
				source: 'kflash.js',
			},
			(report) => {
				return this.real_run(report, cancel.token);
			},
			() => {
				cancel.cancel();
			},
		).then(() => {
			this.logger.info('==================================');
			this.logger.info('Data successfully flashed to the board.');
		}, (e) => {
			this.logger.error('==================================');
			this.logger.error('Flash failed with error: ' + e.message);
		});
	}
}

export class MaixSerialRebootISPAction extends MaixSerialRebootActionBase {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_BOOT_ISP;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_BOOT_ISP;
	readonly target: string = 'isp';

}

export class MaixSerialRebootAction extends MaixSerialRebootActionBase {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_BOOT;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_BOOT;
	readonly target: string = 'program';
}
