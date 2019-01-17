import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { app, RelaunchOptions } from 'electron';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { ILifecycleService } from 'vs/platform/lifecycle/electron-main/lifecycleMain';
import { isUpdater } from 'vs/kendryte/vs/base/common/platform';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { Socket } from 'net';
import { ILogService } from 'vs/platform/log/common/log';
import * as split2 from 'split2';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { connectToHost } from 'vs/kendryte/vs/platform/vscode/common/socket';

export interface IRelaunchMainService extends IRelaunchService {
	preExit(): Promise<void>;
}

export const IRelaunchMainService = createDecorator<IRelaunchMainService>('relaunchService');

interface IProtocol {
	type: string;
	data: any;
	token: number;
}

interface IResolver {
	resolve(data: any): void;
	reject(err: Error): void;
}

class MainProcessRelaunchService implements IRelaunchMainService {
	_serviceBrand: any;

	private socket: Socket;
	private readonly waitResponse = new Map<number, IResolver>();
	private conStable = new DeferredPromise<void>();

	constructor(
		@IEnvironmentService environmentService: IEnvironmentService,
		@IWindowsMainService private readonly windowsService: IWindowsMainService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@ILogService private readonly logService: ILogService,
	) {
	}

	private disconnect() {
		delete this.socket;
	}

	private connectCalled: Promise<void>;

	public connect() {
		if (this.connectCalled) {
			return this.connectCalled;
		}
		return this.connectCalled = this._connect();
	}

	async _connect() {
		if (!isUpdater) {
			this.logService.warn('MainProcessRelaunchService: Not start from updater');
			const commonError = new Error('Not started from updater.');
			this.conStable.error(commonError);
			return Promise.reject(commonError);
		}
		this.logService.info('MainProcessRelaunchService: Start from updater');

		app.relaunch = (options?: RelaunchOptions) => {
			this.logService.info('MainProcessRelaunchService#relaunch');
			return this.send('please-relaunch', options);
		};

		const host = process.env.KENDRYTE_IDE_UPDATER_PIPE || '';
		this.logService.info('connection to updater socket: ' + host);
		const ipc = this.socket = connectToHost(host);
		ipc.on('error', e => {
			this.logService.error('MainProcessRelaunchService: updater server error:\n' + e.stack);
			ipc.end();
			this.disconnect();
		});
		ipc.on('end', () => {
			this.logService.error('MainProcessRelaunchService: updater server disconnected.');
			this.disconnect();
		});
		ipc.pipe(split2(JSON.parse)).on('data', (line: IProtocol) => {
			this.logService.info('[Update IPC Client] recv', line);
			if (line.type === 'response') {
				this.handleResponse(line.data, line.token);
			} else {
				const response = (data: any) => {
					if (data instanceof Error) {
						data = {
							error: 1,
							message: data.message,
							stack: data.stack,
							name: data.name,
						};
					}
					this._send('response', data, line.token).catch((e) => {
						this.logService.error('[ISP] response ipc fail:', e);
					});
				};
				switch (line.type) {
					case 'hello':
						return response(process.env.KENDRYTE_IDE_UPDATER_PIPE_ID);
					case 'stable':
						setTimeout(() => {
							this.conStable.complete(undefined);
						}, 500);
						return response('');
					default:
						return response('');
				}
			}
		});
	}

	relaunch() {
		this.lifecycleService.relaunch({});
	}

	public createLogsTarball(): Promise<string> {
		return this.send('please-create-log-zip', '');
	}

	public launchUpdater() {
		return this.send('please-update', '').then(() => {
			this.lifecycleService.quit(false);
		});
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

	private token: number = 0;

	private nextToken() {
		this.token++;
		return this.token;
	}

	private handleResponse(data: any, token: number) {
		const cb = this.waitResponse.get(token);
		if (cb) {
			try {
				if (data && data.error) {
					const e = new Error(data.message);
					e.stack = data.stack;
					e.name = data.name;
					cb.reject(e);
				} else {
					cb.resolve(data);
				}
			} catch (e) {
				this.logService.error('[Update IPC Client] response fail', e);
			}
		} else {
			this.logService.error('[Update IPC Client] response not expect:', token, data);
		}
	}

	private _send(type: string, data: any, token = this.nextToken()): Promise<void> {
		this.logService.info('[Update IPC Client] send:', { type, data, token });
		this.socket.write(JSON.stringify({ type, data, token }) + '\n');
		return new Promise((resolve, reject) => {
			this.waitResponse.set(token, { resolve, reject });
		});
	}

	private send(type: string, data: any, token = this.nextToken()): Promise<any> {
		if (isUpdater) {
			if (!this.conStable.completed) {
				return this.conStable.p.then(() => {
					return this._send(type, data, token);
				});
			}

			return this._send(type, data, token);
		} else {
			return this.connect();
		}
	}
}

registerMainSingleton(IRelaunchMainService, MainProcessRelaunchService);
