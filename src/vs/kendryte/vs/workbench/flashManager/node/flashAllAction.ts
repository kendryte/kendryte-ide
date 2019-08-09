import { Action } from 'vs/base/common/actions';
import { ACTION_ID_FLASH_MANGER_FLASH_ALL, ACTION_LABEL_FLASH_MANGER_FLASH_ALL } from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { FlashTargetType, SerialLoader } from 'vs/kendryte/vs/platform/serialPort/flasher/node/flasher';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { CHIP_BAUDRATE } from 'vs/kendryte/vs/platform/serialPort/flasher/common/chipDefine';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { lstat } from 'vs/base/node/pfs';
import { CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProgressService, ProgressLocation } from 'vs/platform/progress/common/progress';
import { SubProgress } from 'vs/kendryte/vs/platform/config/common/progress';
import { parseMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { createReadStream } from 'fs';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

interface IMySection {
	name: string;
	filepath: string;
	startHex: string;
	start: number;
	swapBytes: boolean;
	size: number;
}

export class FlashAllAction extends Action {
	static readonly ID = ACTION_ID_FLASH_MANGER_FLASH_ALL;
	static readonly LABEL = ACTION_LABEL_FLASH_MANGER_FLASH_ALL;
	private readonly logger: IChannelLogger;
	private readonly bootLoader: string;
	private model: IDisposable;

	constructor(
		id = FlashAllAction.ID, label = FlashAllAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ISerialPortService private readonly serialPortService: ISerialPortService,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
		@IEnvironmentService private readonly environmentService: IEnvironmentService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IFlashManagerService private readonly flashManagerService: IFlashManagerService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IProgressService private readonly progressService: IProgressService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
		this.bootLoader = this.nodePathService.getPackagesPath('isp/bootloader.bin'); // todo
	}

	async run(path: string | any) {
		let rootPath = '';
		if (typeof path === 'string') {
			rootPath = path;
		} else {
			rootPath = this.kendryteWorkspaceService.requireCurrentWorkspaceFile();
		}
		const model = this.model = await this.flashManagerService.getFlashManagerModel(rootPath);

		const sections: IMySection[] = (await model.createSections()).map((item) => {
			return {
				name: item.varName,
				filepath: item.filepath,
				startHex: item.startHex,
				start: parseMemoryAddress(item.startHex),
				size: item.size,
				swapBytes: item.swapBytes,
			};
		});
		sections.forEach((item) => {
			this.logger.info(` -- [${item.name}] ${item.startHex}`);
			this.logger.info(`    ${item.filepath}`);
		});

		await this.serialPortService.refreshDevices();
		const sel = this.serialPortService.lastSelect || await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.openPort(sel, {
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
			baudRate: CHIP_BAUDRATE,
		}, true);
		this.logger.info(' - OK');

		this.logger.info('BootLoader:');
		this.logger.info(`\t${this.bootLoader}`);
		const bootLoaderSize = (await lstat(this.bootLoader)).size;
		this.logger.info(`\t${bootLoaderSize} bytes`);

		const br = parseInt(this.configurationService.getValue(CONFIG_KEY_FLASH_SERIAL_BAUDRATE)) || CHIP_BAUDRATE;
		this.logger.info('Will use baudrate while flash: ' + br + ' (init port with ' + CHIP_BAUDRATE + ')');

		this.logger.info('==================================');

		const loader = new SerialLoader(
			this.instantiationService,
			this.serialPortService,
			port,
			this.logger,
			!this.environmentService.isBuilt,
		);

		loader.setBaudRate(br);
		loader.setBootLoader(this.bootLoader);
		loader.setFlashTarget(FlashTargetType.InChip);

		const p = this.progressService.withProgress(
			{
				location: ProgressLocation.Notification,
				title: `Flash program`,
				total: 100,
				cancellable: true,
			},
			(report) => {
				return this.flashProgress(loader, sections, bootLoaderSize, new SubProgress('loading...', report));
			},
			() => loader.abort(new Error('user cancel')),
		);

		await p.then(() => {
			this.logger.info('==================================');
			this.logger.info('Data successfully flashed to the board.');
			loader.dispose();
		}, (e) => {
			this.logger.error('==================================');
			this.logger.error('Flash failed with error: ' + e.message);
			loader.dispose();
			this.channelLogService.show(this.logger.id);
		});

	}

	async flashProgress(flasher: SerialLoader, sections: IMySection[], bootLoaderSize: number, report: SubProgress) {
		report.splitWith([
			0, // greeting
			bootLoaderSize, // flash bootloader
			0, // boot
			...sections.map(item => item.size),
		]);

		report.message('greeting...');
		await Promise.race<any>([flasher.abortedPromise, flasher.rebootISPMode()]);
		report.next();

		report.message('flashing bootloader...');
		await Promise.race<any>([flasher.abortedPromise, flasher.flashBootLoader(report)]);
		report.next();

		report.message('booting up bootloader...');
		await Promise.race<any>([flasher.abortedPromise, flasher.executeBootloader(report)]);

		for (const item of sections) {
			report.next();
			this.logger.log(' ');
			this.logger.log('> ' + item.name + ':');
			report.message(`flashing ${item.name} to ${item.startHex}...`);

			await Promise.race<any>([
				flasher.abortedPromise, flasher.flashData(
					createReadStream(item.filepath),
					item.start,
					item.swapBytes,
					report,
				),
			]);
		}
	}

	public dispose() {
		super.dispose();
		if (this.model) {
			this.model.dispose();
		}
	}
}
