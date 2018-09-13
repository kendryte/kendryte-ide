import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_SERIAL_UPLOAD, INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { ChipType, SerialLoader } from 'vs/workbench/parts/maix/serialPort/upload/node/flasher';
import { ChannelLogService } from 'vs/workbench/parts/maix/_library/node/channelLog';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { exists, lstat } from 'vs/base/node/pfs';
import { IProgressService2, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { SubProgress } from 'vs/workbench/parts/maix/_library/common/progress';
import { ISerialPortService } from 'vs/workbench/parts/maix/serialPort/node/serialPortService';

export class MaixSerialUploadAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_UPLOAD;
	public static readonly LABEL = localize('Upload', 'Upload');

	static lastSelected: string;
	private readonly logService: ChannelLogService;

	constructor(
		id: string, label: string,
		@IInstantiationService instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INodePathService private nodePathService: INodePathService,
		@ICMakeService private cMakeService: ICMakeService,
		@IProgressService2 private progressService: IProgressService2,
	) {
		super(id, label);
		this.logService = instantiationService.createInstance(ChannelLogService, CMAKE_CHANNEL, 'Build/Run');
	}

	async run(): TPromise<void> {
		const sel = await this.serialPortService.quickOpenDevice();
		if (!sel) {
			return;
		}

		this.logService.show();

		await this.cMakeService.ensureConfiguration();

		this.logService.info('Program:');
		const app = await this.cMakeService.getOutputFile();
		this.logService.info(`\t${app}`);

		if (!await exists(app)) {
			const message = 'Application has not compiled.';
			this.logService.error(message);
			throw new Error(message);
		}

		this.logService.info(`\t${(await lstat(app)).size} bytes`);

		this.logService.info(`Opening serial port ${sel}`);
		const port = await this.serialPortService.openPort(sel, {
			dataBits: 8,
			parity: 'none',
			stopBits: 1,
		});
		this.logService.info('\t - OK.');

		const bootLoader = this.nodePathService.getPackagesPath('isp/bootloader.bin'); // todo
		this.logService.info('BootLoader:');
		this.logService.info(`\t${bootLoader}`);

		if (!await exists(app)) {
			const message = 'BootLoader does not exists.';
			this.logService.error(message);
			throw new Error(message);
		}

		this.logService.info(`\t${(await lstat(bootLoader)).size} bytes`);

		this.logService.info('==================================');

		const loader = new SerialLoader(
			port,
			app,
			bootLoader,
			null,
			ChipType.InChip,
			this.logService,
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
			this.logService.info('==================================');
			this.logService.info('Program successfully flashed to the board.');
			loader.dispose();
			port.close();
		}, (e) => {
			this.logService.error('==================================');
			this.logService.error('Flash failed with error: ' + e.message);
			loader.dispose();
			port.close();
		});
	}
}