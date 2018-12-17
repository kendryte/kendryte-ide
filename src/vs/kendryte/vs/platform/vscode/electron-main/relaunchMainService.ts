import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { app } from 'electron';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { ILifecycleService } from 'vs/platform/lifecycle/electron-main/lifecycleMain';
import { isUpdater } from 'vs/kendryte/vs/base/common/platform';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { Transform } from 'stream';
import { createConnection, Socket } from 'net';
import { ILogService } from 'vs/platform/log/common/log';

export interface IRelaunchMainService extends IRelaunchService {
	preExit(): Promise<void>;
}

export const IRelaunchMainService = createDecorator<IRelaunchMainService>('relaunchService');

class MainProcessRelaunchService implements IRelaunchMainService {
	_serviceBrand: any;

	private socket: Socket;
	private ipc: NodeJS.ReadableStream & NodeJS.WritableStream;
	private readonly waitResponse = new Map<string, IResolver>();

	constructor(
		@IEnvironmentService environmentService: IEnvironmentService,
		@IWindowsMainService private readonly windowsService: IWindowsMainService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@ILogService private readonly logService: ILogService,
	) {
		if (isUpdater) {
			this.ipc = this.connect();
		} else {
			this.ipc = new Transform({ transform(data: any, encoding: string, callback: Function) {callback();} });
		}
	}

	private connect() {
		const ipc = this.socket = createConnection(process.env.KENDRYTE_IDE_UPDATER_PIPE);
		ipc.on('error', e => {
			this.logService.error('updater server error:\n' + e.stack);
			ipc.end();
			delete this.ipc;
		});
		ipc.on('end', () => {
			this.logService.error('updater server disconnected.');
			delete this.ipc;
		});
		ipc.on('connect', () => {
			this.send('hello', process.env.KENDRYTE_IDE_UPDATER_PIPE_ID).catch();
		});

		ipc.on('');
		this.ipc = createConnection();
	}

	relaunch() {
		this.lifecycleService.relaunch({});
	}

	public notifySuccess() {
		console.log('MainProcessRelaunchService#notifySuccess');
		process.send('im-ok');
	}

	public launchUpdater() {
		if (isUpdater) {
			process.send('please-update');
			this.lifecycleService.quit(false);
		} else {
			throw new Error('Not started from updater.');
		}
	}

	preExit(): Promise<void> {
		app.removeAllListeners('window-all-closed'); // prevent livecycleService handle this, or app will quit
		const p = new Promise<void>((resolve, reject) => {
			app.once('window-all-closed', (e: Event) => { // handle it myself instead
				resolve();
			});
		});
		this.windowsService.getWindows().forEach((win) => { // then, close all window
			win.close(); // livecycleService will notice this, and do any cleanup
		});
		return p;
	}

	private token = 1;

	private send(type: string, data: any): Promise<void> {
		const token = this.token;
		this.token++;
		this.socket.write(JSON.stringify({ type, data, token }) + '\n');
		return new Promise((resolve) => {
			this.waitResponse.set(type, resolve);
		});
	}
}

registerMainSingleton(IRelaunchMainService, MainProcessRelaunchService);
