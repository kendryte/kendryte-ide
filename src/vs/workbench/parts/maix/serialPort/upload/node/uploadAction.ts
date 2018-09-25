import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_SERIAL_UPLOAD, INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { ChipType, SerialLoader } from 'vs/workbench/parts/maix/serialPort/upload/node/flasher';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { exists, lstat } from 'vs/base/node/pfs';
import { IProgressService2, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { SubProgress } from 'vs/workbench/parts/maix/_library/common/progress';
import { ISerialPortService } from 'vs/workbench/parts/maix/serialPort/node/serialPortService';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { IChannelLogger, IChannelLogService } from 'vs/workbench/parts/maix/_library/node/channelLogService';

export class MaixSerialUploadAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_UPLOAD;
	public static readonly LABEL = localize('Upload', 'Upload');

	static lastSelected: string;
	private readonly logger: IChannelLogger;

	constructor(
		id: string, label: string,
		@IInstantiationService instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INodePathService private nodePathService: INodePathService,
		@ICMakeService private cMakeService: ICMakeService,
		@IProgressService2 private progressService: IProgressService2,
		@IChannelLogService channelLogService: IChannelLogService,
	) {
		super(id, label);
		this.logger = channelLogService.createChannel({
			id: CMAKE_CHANNEL, label: 'Build/Run', log: false,
		});
	}

	async run(): TPromise<void> {
		await this.serialPortService.refreshDevices();
		const sel = await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		this.logger.show();

		await this.cMakeService.ensureConfiguration();

		this.logger.info('Program:');
		const app = resolvePath(await this.cMakeService.getOutputFile()) + '.bin';
		this.logger.info(`\t${app}`);

		if (!await exists(app)) {
			const message = 'Application has not compiled.';
			this.logger.error(message);
			throw new Error(message);
		}

		this.logger.info(`\t${(await lstat(app)).size} bytes`);

		this.logger.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.openPort(sel, {
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
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
			port,
			app,
			bootLoader,
			null,
			ChipType.InChip,
			this.logger,
		);

		const p = this.progressService.withProgress(
			{
				location: ProgressLocation.Notification,
				title: `Flash program`,
				total: 100,
				cancellable: true,
			},
			(report) => loader.run(new SubProgress('', report)),
			() => loader.abort(new Error('user cancel')),
		);

		await p.then(() => {
			this.logger.info('==================================');
			this.logger.info('Program successfully flashed to the board.');
			loader.dispose();
			port.close();
		}, (e) => {
			this.logger.error('==================================');
			this.logger.error('Flash failed with error: ' + e.message);
			loader.dispose();
			port.close();
		});
	}
}