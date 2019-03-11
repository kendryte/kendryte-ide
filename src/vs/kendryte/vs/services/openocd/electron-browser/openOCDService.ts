import { AddressInfo, createServer } from 'net';
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
	CONFIG_KEY_FTDI_VIDPID,
	CONFIG_KEY_JTAG_ID,
	CONFIG_KEY_JTAG_SPEED,
	CONFIG_KEY_OPENOCD_CORE,
	CONFIG_KEY_OPENOCD_PORT,
	CONFIG_KEY_OPENOCD_USE,
} from 'vs/kendryte/vs/base/common/configKeys';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { OPENOCD_CHANNEL, OPENOCD_CHANNEL_TITLE } from 'vs/kendryte/vs/services/openocd/common/channel';
import { createCustomConfig } from 'vs/kendryte/vs/platform/openocd/common/custom';
import { createDefaultFtdiConfig } from 'vs/kendryte/vs/platform/openocd/common/ftdi';
import { ConfigOpenOCDTypes } from 'vs/kendryte/vs/platform/openocd/common/openocd';
import { createDefaultJTagConfig } from 'vs/kendryte/vs/platform/openocd/common/jtag';
import { DetectJTagIdAction } from 'vs/kendryte/vs/services/openocd/electron-browser/actions/jtagFindId';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as split2 from 'split2';
import { DeferredPromise } from 'vs/base/test/common/utils';
import { timeout } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { IDebugService } from 'vs/workbench/parts/debug/common/debug';

const libUsbError = /\bLIBUSB_ERROR_IO\b/;
const libUsbDisconnect = /\bLIBUSB_ERROR_NO_DEVICE\b/;
const TDOHigh = /\bTDO seems to be stuck high\b/;
const startOk = /\bExamined RISCV core\b/;
const commonError = / IR capture error; saw /;

export class OpenOCDService implements IOpenOCDService {
	_serviceBrand: any;
	private openocd: string;
	private child: ChildProcess;
	private readonly logger: IChannelLogger;

	private currentConfigFile: string;
	private okPromise: DeferredPromise<void>;
	private okWait: boolean;

	// private currentJTag: number;

	constructor(
		@ILifecycleService lifecycleService: ILifecycleService,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IInstantiationService private readonly IInstantiationService: IInstantiationService,
		@IDebugService private readonly debugService: IDebugService,
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
			await this.stop(true);
		}
		await this.start(true);
	}

	async stop(restart: boolean = false) {
		this.logger.info('stop openocd server.');
		if (this.child) {
			const child = this.child;
			delete this.child;
			if (restart) {
				child.removeAllListeners('error');
				child.removeAllListeners('exit');
			}

			const p = new Promise((resolve, reject) => {
				child.on('exit', resolve);
			});
			child.kill('SIGINT');
			await p;
			this.logger.info('stopped.');
		} else {
			this.logger.warn('server not start.');
		}
	}

	async start(restart: boolean = false) {
		if (this.child) {
			this.logger.warn('server already started.');
			return;
		}

		this.logger.clear();
		this.logger.info('start openocd server.');

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

		if (!restart || !this.okPromise) {
			this.okPromise = new DeferredPromise();
			this.okPromise.p.then(() => {
				this.okWait = false;
				this.logger.info('------------------------- OpenOCD started...');
			}, (e) => {
				this.okWait = false;
				this.logger.error(`OpenOCD Command ${e.message}`);
				this.kill();
			});
		}
		this.okWait = true;

		child.stdout.pipe(split2()).on('data', this.handleOutput);
		child.stderr.pipe(split2()).on('data', this.handleOutput);

		child.once('error', (e) => {
			if (this.okWait) {
				this.okPromise.error(new Error(`OpenOCD process cannot start: ${e.message}`));
			}
		});
		child.on('exit', (code, signal) => {
			if (this.okWait) {
				this.okPromise.error(new Error(`OpenOCD process died: ${signal || code || 'unknown why'}`));
			}
			if (signal || code) {
				this.logger.error(`OpenOCD process exit with %s`, signal || code);
				if (signal !== 'SIGINT') {
					this.channelLogService.show(OPENOCD_CHANNEL);
				}
			} else {
				this.logger.info('OpenOCD process successful finished');
			}
			delete this.child;
			this.debugService.stopSession(null);
		});

		this.logger.info('OpenOCD process started. waiting for output...');

		this.delayActions();

		return this.okPromise.p;
	}

	private delayActions() {
		const cancelNote = new CancellationTokenSource();
		this.okPromise.p.then(() => {
			cancelNote.cancel();
		}, () => {
			cancelNote.cancel();
		});
		timeout(3000, cancelNote.token).then(() => {
			this.logger.warn(`!!! Still starting, too slow !!!`);
			this.channelLogService.show(OPENOCD_CHANNEL);
		}, undefined);
		timeout(10000, cancelNote.token).then(() => {
			this.okPromise.error(new Error('Cannot start within 10s, please check log.'));
			this.channelLogService.show(OPENOCD_CHANNEL);
		}, undefined);
	}

	private async createConfigFile() {
		const file = this.nodePathService.workspaceFilePath('.vscode/openocd.cfg');
		this.logger.info('config file write to: ' + file);
		const data = await this.createConfigContent();
		await this.nodeFileSystemService.writeFileIfChanged(file, data);
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
					vidPid: this.configurationService.getValue<[string, string]>(CONFIG_KEY_FTDI_VIDPID),
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
				const port = (s.address() as AddressInfo).port;
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
			this.logger.warn('LIBUSB_ERROR_IO');
			this.logger.warn('maybe:');
			this.logger.warn(' * no hardware permission');
			this.logger.warn(' * port is busy');
			this.logger.warn(' * windows: driver not valid');
			this.okPromise.error(new Error('Connection failed.'));
		} else if (libUsbDisconnect.test(line)) {
			this.stop().catch(undefined);
		} else if (TDOHigh.test(line)) {
			this.restart().catch(undefined);
		} else if (this.okWait) {
			if (startOk.test(line)) {
				this.okPromise.complete(undefined);
			} else if (commonError.test(line)) {
				this.logger.warn('maybe:');
				this.logger.warn(' * VRef is wrong');
				this.logger.warn(' * power fail');
				this.okPromise.error(new Error('Failed to communicate with cpu, please check your connection.'));
			}
		}
	}
}

registerSingleton(IOpenOCDService, OpenOCDService);