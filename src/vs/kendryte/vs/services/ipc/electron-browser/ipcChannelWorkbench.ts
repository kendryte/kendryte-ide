import { IKendryteMainIpcChannel, IKendryteServiceRunnerChannel } from 'vs/kendryte/vs/services/ipc/node/ipc';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';

const symbolMethod = Symbol('ipc-method-mark');
const symbolEvent = Symbol('ipc-event-mark');

class KendryteIPCWorkbenchService implements IKendryteClientService {
	_serviceBrand: any;
	private readonly mapper = new Map<string, any>();

	constructor(
		@IKendryteMainIpcChannel protected readonly mainChannel: IKendryteMainIpcChannel,
		@IKendryteServiceRunnerChannel protected readonly runnerChannel: IKendryteServiceRunnerChannel,
		@ILogService protected readonly logService: ILogService,
	) {
	}

	public listen<T>(event: string): Event<T> {
		return this.mainChannel.listen(event);
	}

	markEvents<T>(service: ServiceIdentifier<T>, events: (keyof T)[]) {
		if (!service.hasOwnProperty(symbolEvent)) {
			Object.defineProperty(service, symbolEvent, {
				value: [],
				configurable: false,
				enumerable: true,
				writable: false,
			});
		}
		service[symbolEvent].push(...events);
	}

	markMethod<T>(service: ServiceIdentifier<T>, methods: (keyof T)[]) {
		if (!service.hasOwnProperty(symbolMethod)) {
			Object.defineProperty(service, symbolMethod, {
				value: [],
				configurable: false,
				enumerable: true,
				writable: false,
			});
		}
		service[symbolMethod].push(...methods);
	}

	public as<T>(service: ServiceIdentifier<T>): T {
		const id = service.toString();
		if (!this.mapper.has(id)) {
			const channel = this._create(id, service[symbolMethod] || [], service[symbolEvent] || []);
			this.mapper.set(id, channel);
		}
		return this.mapper.get(id);
	}

	private _create(id: string, methods: string[], events: string[]) {
		const proxy = Object.create(null);
		proxy[Symbol.toStringTag] = () => id;

		for (const method of methods) {
			proxy[method] = (...arg) => this._callService(id, method, arg);
		}
		for (const event of events) {
			proxy[event] = (...arg) => this._listenService(id, event, arg);
		}
		Object.freeze(proxy);
		return proxy;
	}

	private _callService(id: string, method: string, args: any[]): TPromise<any> {
		this.logService.info(`callService(${id}, ${method},`, args, ');');
		return this.runnerChannel.call(`${id}:${method}`, args);
	}

	private _listenService(id: string, method: string, args: any[]): Event<any> {
		this.logService.info(`listenService(${id}, ${method},`, args, ');');
		return this.runnerChannel.listen(`${id}:${method}`, args);
	}
}

registerSingleton(IKendryteClientService, KendryteIPCWorkbenchService);