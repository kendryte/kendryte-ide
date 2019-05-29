import { Action } from 'vs/base/common/actions';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { exists, lstat } from 'vs/base/node/pfs';
import { IProgressService2, ProgressLocation } from 'vs/platform/progress/common/progress';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { ISerialPortService, SerialPortCloseReason } from 'vs/kendryte/vs/services/serialPort/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ACTION_ID_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';
import {
	ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_ID_MAIX_SERIAL_UPLOAD,
	ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_LABEL_MAIX_SERIAL_UPLOAD,
} from 'vs/kendryte/vs/base/common/menu/serialPort';
import { FlashTargetType, SerialLoader } from 'vs/kendryte/vs/platform/serialPort/flasher/node/flasher';
import { CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { createActionInstance } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { CHIP_BAUDRATE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

export class MaixSerialUploadAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_UPLOAD;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_UPLOAD;

	private readonly logger: IChannelLogger;

	constructor(
		id: string = MaixSerialUploadAction.ID, label: string = MaixSerialUploadAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INodePathService private nodePathService: INodePathService,
		@ICMakeService private cMakeService: ICMakeService,
		@IProgressService2 private progressService: IProgressService2,
		@IChannelLogService private channelLogService: IChannelLogService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IEnvironmentService private environmentService: IEnvironmentService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	async run(): Promise<void> {
		await this.serialPortService.refreshDevices();
		const sel = this.serialPortService.lastSelect || await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		await this.cMakeService.ensureConfiguration();

		this.logger.info('Program:');
		const app = resolvePath(await this.cMakeService.getOutputFile());
		this.logger.info(`\t${app}`);

		if (!await exists(app)) {
			const message = 'Application has not compiled.';
			this.logger.error(message);
			throw new Error(message);
		}

		this.logger.info(`\t${(await lstat(app)).size} bytes`);

		const br = parseInt(this.configurationService.getValue(CONFIG_KEY_FLASH_SERIAL_BAUDRATE)) || CHIP_BAUDRATE;
		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.openPort(sel, {
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			baudRate: CHIP_BAUDRATE,
		}, true);
		this.logger.info('\t - OK.');

		const bootLoader = this.nodePathService.getPackagesPath('isp/bootloader.bin'); // todo
		this.logger.info('BootLoader:');
		this.logger.info(`\t${bootLoader}`);

		if (!await exists(app)) {
			const message = 'BootLoader does not exists.';
			this.logger.error(message);
			throw new Error(message);
		}

		this.logger.info(`\t${(await lstat(bootLoader)).size} bytes`);

		this.logger.info('==================================');

		const loader = new SerialLoader(
			this.instantiationService,
			this.serialPortService,
			port,
			this.logger,
			!this.environmentService.isBuilt,
		);

		loader.setBaudRate(br);
		loader.setProgram(app);
		loader.setBootLoader(bootLoader);
		loader.setFlashTarget(FlashTargetType.InChip);

		const p = this.progressService.withProgress(
			{
				location: ProgressLocation.Notification,
				title: `Flash program`,
				total: 100,
				cancellable: true,
			},
			(report) => {
				const p = new SubProgress('', report);
				return loader.run(p).finally(() => {
					p.dispose();
				});
			},
			() => loader.abort(new Error('user cancel')),
		);

		await p.then(() => {
			this.logger.info('==================================');
			this.logger.info('Program successfully flashed to the board.');
			loader.dispose();
		}, (e) => {
			this.logger.error('==================================');
			this.logger.error('Flash failed with error: ' + e.message);
			loader.dispose();
			this.channelLogService.show(this.logger.id);
		});

		await this.serialPortService.closePort(port, SerialPortCloseReason.FlashComplete);
	}
}

export class MaixSerialBuildUploadAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD;

	constructor(
		id: string = MaixSerialUploadAction.ID, label: string = MaixSerialUploadAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	async run() {
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_CMAKE_BUILD).run(false);
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_SERIAL_UPLOAD).run();
	}
}
