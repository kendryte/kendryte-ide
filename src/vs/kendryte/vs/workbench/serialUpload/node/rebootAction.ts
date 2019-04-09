import { Action } from 'vs/base/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProgressService2, ProgressLocation } from 'vs/platform/progress/common/progress';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { ACTION_ID_MAIX_SERIAL_BOOT, ACTION_LABEL_MAIX_SERIAL_BOOT } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { SerialLoader } from 'vs/kendryte/vs/workbench/serialUpload/node/flasher';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';

export class MaixSerialRebootAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_BOOT;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_BOOT;
	public static readonly ARGUMENTS = [{ name: 'type', description: 'boot to ISP or program (isp or program).', constraint: String }];

	private readonly logger: IChannelLogger;
	private loader: SerialLoader;

	constructor(
		id: string = MaixSerialRebootAction.ID, label: string = MaixSerialRebootAction.LABEL,
		@IInstantiationService instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@IProgressService2 private progressService: IProgressService2,
		@IChannelLogService channelLogService: IChannelLogService,
		@IConfigurationService private configurationService: IConfigurationService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	public dispose() {
		super.dispose();
		if (this.loader) {
			this.loader.abort(new Error('success rebooted'));
			this.loader.dispose();
		}
	}

	async run(event: string[]): Promise<void> {
		if (!Array.isArray(event)) {
			throw new Error('Cannot run this action from here.');
		}
		const target = event[0];
		if (target !== 'isp' && target !== 'program') {
			throw new Error('Invalid argument, only allow "isp" and "program".');
		}

		this.logger.clear();
		await this.serialPortService.refreshDevices();
		const sel = this.serialPortService.lastSelect || await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		const br = parseInt(this.configurationService.getValue(CONFIG_KEY_FLASH_SERIAL_BAUDRATE)) || 115200;
		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.openPort(sel, {
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			baudRate: br,
		}, false);
		this.logger.info('\t - OK.');

		this.logger.info('==================================');

		const loader = this.loader = new SerialLoader(
			this.serialPortService,
			port,
			this.logger,
		);
		loader.abortedPromise.catch((e) => {
			console.log('flasher output: %s', e ? e.message || e : e);
		});

		return this.progressService.withProgress(
			{
				location: ProgressLocation.Notification,
				title: `Rebooting`,
				total: 100,
				cancellable: true,
			},
			(report) => {
				if (target === 'isp') {
					return loader.rebootISPMode();
				} else {
					return loader.rebootNormalMode();
				}
			},
			() => loader.abort(new Error('user cancel')),
		);
	}
}
