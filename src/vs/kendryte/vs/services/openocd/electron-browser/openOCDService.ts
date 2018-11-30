import { createServer } from 'net';
import { ChildProcess, spawn } from 'child_process';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IOpenOCDService } from 'vs/kendryte/vs/services/openocd/common/openOCDService';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import {
	CONFIG_KEY_CUSTOM,
	CONFIG_KEY_FTDI_EXTRA,
	CONFIG_KEY_FTDI_LAYOUT,
	CONFIG_KEY_FTDI_SPEED,
	CONFIG_KEY_FTDI_TDO_FE,
	CONFIG_KEY_JTAG_ID,
	CONFIG_KEY_JTAG_SPEED,
	CONFIG_KEY_OPENOCD_CORE,
	CONFIG_KEY_OPENOCD_PORT,
	CONFIG_KEY_OPENOCD_USE,
} from 'vs/kendryte/vs/base/common/configKeys';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { OPENOCD_CHANNEL, OPENOCD_CHANNEL_TITLE } from 'vs/kendryte/vs/services/openocd/common/channel';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { createCustomConfig } from 'vs/kendryte/vs/platform/openocd/common/custom';
import { createDefaultFtdiConfig } from 'vs/kendryte/vs/platform/openocd/common/ftdi';
import { ConfigOpenOCDTypes } from 'vs/kendryte/vs/platform/openocd/common/openocd';
import { createDefaultJTagConfig } from 'vs/kendryte/vs/platform/openocd/common/jtag';
import { writeFile } from 'vs/base/node/pfs';
import { DetectJTagIdAction } from 'vs/kendryte/vs/services/openocd/electron-browser/actions/jtagFindId';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as split2 from 'split2';

const libUsbError = /\bLIBUSB_ERROR_IO\b/;
const TDOHigh = /\bTDO seems to be stuck high\b/;

export class OpenOCDService implements IOpenOCDService {
	_serviceBrand: any;
	private openocd: string;
	private child: ChildProcess;
	private readonly logger: IChannelLogger;

	private currentConfigFile: string;

	// private currentJTag: number;

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@INotificationService private readonly notificationService: INotificationService,
		@IInstantiationService private readonly IInstantiationService: IInstantiationService,
	) {
		this.logger = channelLogService.createChannel(OPENOCD_CHANNEL_TITLE, OPENOCD_CHANNEL, true);
		this.openocd = nodePathService.getPackagesPath('openocd/openocd' + executableExtension);

		lifecycleService.onShutdown(() => {
			this.kill();
		});

		this.handleOutput = this.handleOutput.bind(this);
	}

	getCurrentPort() {
		if (this.child) {
			return this.configurationService.getValue<number>(CONFIG_KEY_OPENOCD_PORT);
		} else {
			return null;
		}
	}

	private kill() {
		if (this.child) {
			this.child.kill('SIGKILL');
			delete this.child;
		}
	}

	async restart() {
		if (this.child) {
			await this.stop();
		}
		await this.start();
	}

	async stop() {
		this.logger.info('stop openocd server.');
		if (this.child) {
			const p = new Promise((resolve, reject) => {
				this.logger.info('stopped.');
				this.child.on('exit', resolve);
			});
			this.child.kill('SIGINT');
			await p;
		} else {
			this.logger.warn('server not start.');
		}
	}

	async start() {
		this.logger.info('start openocd server.');
		if (this.child) {
			this.logger.warn('server already started.');
			return;
		}
		this.currentConfigFile = await this.createConfigFile();

		const args = ['-f', this.currentConfigFile];

		const debugCore = this.configurationService.getValue<number>(CONFIG_KEY_OPENOCD_CORE);
		if (debugCore !== -1) {
			args.push(`-m${debugCore}`);
		}

		this.logger.info(' + %s %s', this.openocd, args.join(' '));
		const child = this.child = spawn(this.openocd, args, {
			cwd: this.nodePathService.workspaceFilePath(),
		});

		child.stdout.pipe(split2()).on('data', this.handleOutput);
		child.stderr.pipe(split2()).on('data', this.handleOutput);

		child.on('error', (e) => {
			this.logger.error(`OpenOCD Command Failed: ${e.stack}`);
			this.notificationService.warn(`OpenOCD Error: ${e.message}`);
		});
		child.on('exit', (code, signal) => {
			if (signal || code) {
				this.logger.error(`OpenOCD Command exit with %s`, signal || code);
				if (signal !== 'SIGINT') {
					this.channelLogService.show(OPENOCD_CHANNEL);
				}
			} else {
				this.logger.error('OpenOCD Command successful finished');
			}
			delete this.child;
		});

		this.logger.info('started.');
	}

	private async createConfigFile() {
		const file = this.nodePathService.workspaceFilePath('.vscode/openocd.cfg');
		this.logger.info('config file write to: ' + file);
		const data = await this.createConfigContent();
		await writeFile(file, data, { encoding: { charset: 'utf8', addBOM: false } });
		return file;
	}

	private async createConfigContent(): Promise<string> {
		const type = this.configurationService.getValue<string>(CONFIG_KEY_OPENOCD_USE);
		let port = this.configurationService.getValue<number>(CONFIG_KEY_OPENOCD_PORT);
		if (port === 0) {
			port = await this.findPort();
			await this.configurationService.updateValue(CONFIG_KEY_OPENOCD_PORT, port, ConfigurationTarget.USER);
		}
		this.logger.info('port=' + port);

		switch (type) {
			case ConfigOpenOCDTypes.jtag:
				let serialNumber = this.configurationService.getValue<number>(CONFIG_KEY_JTAG_ID);
				// if (serialNumber > 0) {
				// 	this.currentJTag = serialNumber;
				// } else if (this.currentJTag) {
				// 	serialNumber = this.currentJTag;
				// } else {
				// 	serialNumber = this.currentJTag = await this.findJTagSn();
				// }
				return await createDefaultJTagConfig(port, {
					speed: this.configurationService.getValue<number>(CONFIG_KEY_JTAG_SPEED),
					serialNumber,
				});
			case ConfigOpenOCDTypes.ftdi:
				return await createDefaultFtdiConfig(port, {
					speed: this.configurationService.getValue<number>(CONFIG_KEY_FTDI_SPEED),
					layoutInit: this.configurationService.getValue<[string, string]>(CONFIG_KEY_FTDI_LAYOUT),
					tdoSampleFallingEdge: this.configurationService.getValue<boolean>(CONFIG_KEY_FTDI_TDO_FE),
					extra: this.configurationService.getValue<string>(CONFIG_KEY_FTDI_EXTRA),
				});
			default:
				return createCustomConfig(
					port,
					this.configurationService.getValue<string>(CONFIG_KEY_CUSTOM),
				);
		}
	}

	private findPort(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.logger.info('finding port.');
			const s = createServer();
			s.listen(0, () => {
				const port = s.address().port;
				s.close(() => {
					resolve(port);
				});
			});
		});
	}

	protected async findJTagSn() {
		this.logger.info('finding jtag sn.');
		const action = this.IInstantiationService.createInstance(DetectJTagIdAction, DetectJTagIdAction.ID, DetectJTagIdAction.LABEL);
		const sn = action.run();
		this.logger.info(' jtag sn = ' + sn);
		return sn;
	}

	private handleOutput(line: string) {
		this.logger.writeln(`[ OCD] ${line}`);
		if (libUsbError.test(line)) {
			this.kill();
			this.notificationService.error('Error: LIBUSB_ERROR_IO.');
		} else if (TDOHigh.test(line)) {
			this.restart().catch(undefined);
		}
	}
}

registerSingleton(IOpenOCDService, OpenOCDService);