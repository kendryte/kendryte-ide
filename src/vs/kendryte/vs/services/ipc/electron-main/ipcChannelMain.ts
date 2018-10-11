import { IKendryteMainIpcChannel, IKendryteServiceRunnerChannel } from 'vs/kendryte/vs/services/ipc/node/ipc';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator, IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IRemoteProgress } from 'vs/kendryte/vs/services/ipc/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { inspect } from 'util';
import { registerMainIPC } from 'vs/kendryte/vs/platform/instantiation/electron-main/mainIpcExtensions';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IKendryteServerService } from 'vs/kendryte/vs/services/ipc/electron-main/ipcType';

class KendryteIPCMainService implements IKendryteMainIpcChannel {
	_serviceBrand: any;

	private onNotify = new Emitter<IRemoteProgress>();

	constructor(
		@IInstantiationService protected readonly instantiationService: IInstantiationService,
	) {
	}

	public call<T>(command: string, arg?: any, cancellationToken?: CancellationToken): Thenable<T> {
		switch (command) {
		}
		return undefined;
	}

	public listen<T>(event: string, arg?: any): Event<T> {
		switch (event) {
			case 'progress':
				return this.onNotify.event as Event<any>;
			default:
				throw new Error('No event found');
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

	public call<T>(command: string, arg?: any): TPromise<T> {
		const [id, method] = command.split(':');
		return this.instantiationService.invokeFunction((access: ServicesAccessor) => {
			const service = access.get(createDecorator(id));
			this.logService.info(`Service IPC: ${id}.${method}(${arg.map(e => inspect(e)).join(', ')});`);
			try {
				return TPromise.as(service[method](...arg));
			} catch (e) {
				this.logService.error('Service IPC Error:', e);
				throw e;
			}
		});
	}

	public listen<T>(event: string, arg?: any): Event<T> {
		const [id, method] = event.split(':');
		return this.instantiationService.invokeFunction((access: ServicesAccessor) => {
			const service = access.get(createDecorator(id));
			this.logService.info(`Service IPC: ${id}.${method}(${arg.map(e => inspect(e)).join(', ')});`);
			try {
				return service[method](...arg);
			} catch (e) {
				this.logService.error('Service IPC Error:', e);
				throw e;
			}
		});
	}
}

registerMainIPC(IKendryteServiceRunnerChannel, RemoteServiceRunner);
