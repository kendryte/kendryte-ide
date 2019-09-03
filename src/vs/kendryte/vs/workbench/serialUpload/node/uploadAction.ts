import { Action } from 'vs/base/common/actions';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { KFLASH_CHANNEL, KFLASH_CHANNEL_TITLE } from 'vs/kendryte/vs/base/common/messages';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { exists, lstat } from 'vs/base/node/pfs';
import { IProgress, IProgressService, IProgressStep, ProgressLocation } from 'vs/platform/progress/common/progress';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
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
import { createRunDisposeAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { CHIP_BAUDRATE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';

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
		@IProgressService private progressService: IProgressService,
		@IChannelLogService private channelLogService: IChannelLogService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IEnvironmentService private environmentService: IEnvironmentService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel(KFLASH_CHANNEL_TITLE, KFLASH_CHANNEL);
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
			this.logger.info('Program successfully flashed to the board.');
		}, (e) => {
			this.logger.error('==================================');
			this.logger.error('Flash failed with error: ' + e.message);
			this.channelLogService.show(this.logger.id).catch();
		});
	}

	async real_run(report: IProgress<IProgressStep>, token: CancellationToken) {
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

		report.report({
			message: 'connecting serial port: ' + sel,
		});
		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.getPortManager(sel).openPort({
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			baudRate: CHIP_BAUDRATE,
		}, true);
		this._register(port);
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
			token,
			!this.environmentService.isBuilt,
		);
		this._register(loader);

		const br = parseInt(this.configurationService.getValue(CONFIG_KEY_FLASH_SERIAL_BAUDRATE)) || CHIP_BAUDRATE;
		loader.setBaudRate(br);
		loader.setProgram(app);
		loader.setBootLoader(bootLoader);
		loader.setFlashTarget(FlashTargetType.InChip);

		const ps = new SubProgress('', report);
		return loader.run(ps).finally(() => {
			ps.dispose();
		});
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
		await createRunDisposeAction(this.instantiationService, ACTION_ID_MAIX_CMAKE_BUILD, [false]);
		await createRunDisposeAction(this.instantiationService, ACTION_ID_MAIX_SERIAL_UPLOAD);
	}
}
