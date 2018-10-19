import { IKendryteMainIpcChannel, IKendryteServiceRunnerChannel } from 'vs/kendryte/vs/services/ipc/node/ipc';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { URI } from 'vs/base/common/uri';
import { ChannelLogger } from 'vs/kendryte/vs/services/channelLogger/electron-browser/logger';
import { LogEvent } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { IPC_ID_IS_ME_FIRST, IPC_ID_STOP_LOG_EVENT } from 'vs/kendryte/vs/base/common/ipcIds';
import { IWindowService } from 'vs/platform/windows/common/windows';

const symbolMethod = Symbol('ipc-method-mark');
const symbolEventMethod = Symbol('ipc-event-method-mark');
const symbolEvent = Symbol('ipc-event-mark');

class KendryteIPCWorkbenchService implements IKendryteClientService {
	_serviceBrand: any;
	private readonly mapper = new Map<string, any>();

	constructor(
		@IKendryteMainIpcChannel protected readonly mainChannel: IKendryteMainIpcChannel,
		@IWindowService protected readonly windowService: IWindowService,
		@IKendryteServiceRunnerChannel protected readonly runnerChannel: IKendryteServiceRunnerChannel,
		@ILogService protected readonly logService: ILogService,
	) {
	}

	async isMeFirst() {
		return await this.mainChannel.call<boolean>(IPC_ID_IS_ME_FIRST, this.windowService.getCurrentWindowId());
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

	markEventMethod<T>(service: ServiceIdentifier<T>, methods: (keyof T)[]) {
		if (!service.hasOwnProperty(symbolEventMethod)) {
			Object.defineProperty(service, symbolEventMethod, {
				value: [],
				configurable: false,
				enumerable: true,
				writable: false,
			});
		}
		service[symbolEventMethod].push(...methods);
	}

	public as<T>(service: ServiceIdentifier<T>): T {
		const id = service.toString();
		if (!this.mapper.has(id)) {
			const channel = this._create(id, service[symbolMethod] || [], service[symbolEvent] || [], service[symbolEventMethod] || []);
			this.mapper.set(id, channel);
		}
		return this.mapper.get(id);
	}

	private _create(id: string, methods: string[], events: string[], eventMethods: string[]) {
		const proxy = Object.create(null);
		proxy[Symbol.toStringTag] = () => id;

		for (const method of methods) {
			Object.defineProperty(proxy, method, {
				configurable: false,
				enumerable: true,
				value: (...arg) => this._callService(id, method, arg),
				writable: false,
			});
		}
		for (const event of events) {
			Object.defineProperty(proxy, event, {
				configurable: false,
				enumerable: true,
				get: () => this._listenService(id, event),
			});
		}
		for (const em of eventMethods) {
			Object.defineProperty(proxy, em, {
				configurable: false,
				enumerable: true,
				value: (...arg) => this._listenService(id, em, arg),
			});
		}
		Object.freeze(proxy);
		return proxy;
	}

	private _callService(id: string, method: string, args: any[]): TPromise<any> {
		this.logService.info(`callService(${id}, ${method},`, args, ');');

		return this.runnerChannel.call(`${id}:${method}`, this.serializeArg(args));
	}

	private _listenService(id: string, method: string, args?: any[]): Event<any> {
		if (args) {
			this.logService.info(`listenService(${id}, ${method},`, args, ');');
			return this.runnerChannel.listen(`${id}:${method}`, this.serializeArg(args));
		} else {
			this.logService.info(`listenService(${id}, [getter]${method});`);
			return this.runnerChannel.listen(`${id}:${method}`);
		}
	}

	private serializeArg(args: any[]) {
		return args.map((item) => {
			if (URI.isUri(item)) {
				return { __type: 'URI', value: item.toString() };
			}
			if (item instanceof ChannelLogger) {
				this._listenLogger(item);
				return { __type: 'ChannelLogger', value: item.serialize() };
			}

			return item;
		});
	}

	private readonly loggers = new WeakMap<ChannelLogger, boolean>();

	private _listenLogger(logger: ChannelLogger) {
		if (this.loggers.has(logger)) {
			return;
		}
		this.loggers.set(logger, true);
		const { id, window } = logger.serialize();
		const dis = this.mainChannel.listen<LogEvent>('logEvent', [id, window])((d) => {
			logger[d.level](d.message, ...d.args);
		});
		logger.onDispose(() => {
			this.loggers.delete(logger);
			dis.dispose();
			this.mainChannel.call(IPC_ID_STOP_LOG_EVENT, [id, window]);
		});
	}
}

registerSingleton(IKendryteClientService, KendryteIPCWorkbenchService);