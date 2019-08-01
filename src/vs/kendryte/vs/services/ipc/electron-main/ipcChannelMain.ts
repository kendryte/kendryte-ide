import { IKendryteMainIpcChannel, IKendryteServiceRunnerChannel } from 'vs/kendryte/vs/services/ipc/electron-main/ipc';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { createDecorator, IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IRemoteProgress } from 'vs/kendryte/vs/services/ipc/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { inspect } from 'util';
import { registerMainIPC } from 'vs/kendryte/vs/platform/instantiation/electron-main/mainIpcExtensions';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IKendryteServerService } from 'vs/kendryte/vs/services/ipc/electron-main/ipcType';
import { URI } from 'vs/base/common/uri';
import { IMainChannelLogService } from 'vs/kendryte/vs/services/channelLogger/electron-main/service';
import { processErrorStack } from 'vs/kendryte/vs/base/electron-main/errorStack';
import { memoize } from 'vs/base/common/decorators';
import { IPC_ID_IS_ME_FIRST, IPC_ID_STOP_LOG_EVENT } from 'vs/kendryte/vs/base/common/ipcIds';
import { isUndefinedOrNull } from 'vs/base/common/types';

class KendryteIPCMainService implements IKendryteMainIpcChannel {
	_serviceBrand: any;

	private onNotify = new Emitter<IRemoteProgress>();

	constructor(
		@IInstantiationService protected readonly instantiationService: IInstantiationService,
		@ILogService protected readonly logger: ILogService,
	) {
	}

	@memoize
	private get mainChannelLogService() {
		return this.instantiationService.invokeFunction((access) => {
			return access.get<IMainChannelLogService>(IMainChannelLogService);
		});
	}

	public call<T>(context: string, command: string, arg?: any, cancellationToken?: CancellationToken): Promise<T> {
		this.logger.info(`[IPC] command ${command} from ${context}`);
		// arg = this.instantiationService.invokeFunction(parseArgs, arg || []);
		switch (command) {
			case IPC_ID_STOP_LOG_EVENT:
				return this.mainChannelLogService._handleStopLogEvent(arg[0], arg[1]) as any;
			case IPC_ID_IS_ME_FIRST:
				return this.isFirstWindow(arg[0]) as any;
		}
		throw new Error(`No command "${command}" found`);
	}

	public listen<T>(context: string, event: string, arg?: any): Event<T> {
		this.logger.info(`[IPC] listen ${event} from ${context}`);
		switch (event) {
			case 'progress': // TODO: this no impl
				return this.onNotify.event as Event<any>;
			case 'logEvent':
				return this.mainChannelLogService._handleLogEvent(arg[0], arg[1]) as Event<any>;
			default:
				throw new Error(`No event "${event}" found`);
		}
	}

	private firstWindow: number | null = null;

	private async isFirstWindow(windowId: number) {
		// 明明是我先来的……
		if (this.firstWindow === null) {
			this.firstWindow = windowId;
			return true;
		} else {
			return false;
		}
	}
}

registerMainIPC(IKendryteMainIpcChannel, KendryteIPCMainService);
registerMainSingleton(IKendryteServerService, KendryteIPCMainService);

class RemoteServiceRunner implements IKendryteServiceRunnerChannel {
	_serviceBrand: any;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ILogService private readonly logService: ILogService,
	) {
	}

	public async call<T>(context: string, command: string, arg?: any): Promise<T> {
		try {
			arg = normalize(arg);
			arg = this.instantiationService.invokeFunction(parseArgs, arg || []);

			const [id, method] = command.split(':');
			this.logService.info(`Service IPC Call: ${context} -> ${id}.${method}(${arg.map((v: any) => '' + v).join(', ')});`);

			return await this._call(id, method, arg);
		} catch (e) {
			this.logService.error('Service IPC Call Error:\n' + processErrorStack(e));
			debugger;
			return Promise.reject(e);
		}
	}

	private _call(id: string, method: string, arg?: any): Promise<any> {
		return this.instantiationService.invokeFunction((access: ServicesAccessor) => {
			const service: any = access.get(createDecorator(id));
			return service[method](...arg);
		});
	}

	public listen<T>(context: string, event: string, arg?: any): Event<T> {
		try {
			arg = normalize(arg);
			arg = this.instantiationService.invokeFunction(parseArgs, arg || []);

			const [id, method] = event.split(':');
			this.logService.info(`Service IPC Call: ${context} -> ${id}.${method}(${arg.map((v: any) => '' + v).join(', ')});`);

			return this._listen(id, method, arg);
		} catch (e) {
			this.logService.error('Service IPC Listen Error:', e);
			throw e;
		}
	}

	private _listen(id: string, method: string, arg: any[]): Event<any> {
		return this.instantiationService.invokeFunction((access: ServicesAccessor) => {
			const service: any = access.get(createDecorator(id));
			this.logService.info(`Service IPC Listen: ${id}.${method}(${arg.map((e) => inspect(e)).join(', ')});`);
			return service[method](...arg);
		});
	}
}

function normalize(arg: any): any[] {
	if (Array.isArray(arg)) {
		return arg;
	} else if (isUndefinedOrNull(arg)) {
		return [];
	} else {
		return [arg];
	}
}

function parseArgs(access: ServicesAccessor, param: any[]) {
	return param.map((item) => {
		if (item && item.__type) {
			switch (item.__type) {
				case 'URI':
					return URI.parse(item.value);
				case 'ChannelLogger':
					return access.get(IMainChannelLogService).receive(item.value.id, item.value.window);
			}
		}

		return item;
	});
}

registerMainIPC(IKendryteServiceRunnerChannel, RemoteServiceRunner);
