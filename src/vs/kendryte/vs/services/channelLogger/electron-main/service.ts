import { IChannelLogger, LogEvent } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { Disposable } from 'vs/base/common/lifecycle';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';
import { RemoteLogger } from 'vs/kendryte/vs/services/channelLogger/electron-main/remoteLogger';

export interface IMainChannelLogService {
	_serviceBrand: any;

	receive(channelId: string, windowId: number): IChannelLogger;
	_handleLogEvent(channelId: string, windowId: number): Event<LogEvent>;
	_handleStopLogEvent(channelId: string, windowId: number): TPromise<void>;
}

export const IMainChannelLogService = createDecorator<IMainChannelLogService>('mainChannelLogService');

class MainChannelLogService extends Disposable implements IMainChannelLogService {
	_serviceBrand: any;

	private readonly registry = new Map<string, RemoteLogger>();

	constructor() {
		super();
	}

	receive(channelId: string, windowId: number): RemoteLogger {
		const id = `${windowId}:${channelId}`;
		if (this.registry.has(id)) {
			return this.registry.get(id);
		}
		const log = new RemoteLogger(id);
		this.registry.set(id, log);

		return log;
	}

	_handleLogEvent(channelId: string, windowId: number): Event<LogEvent> {
		return this.receive(channelId, windowId).event;
	}

	async _handleStopLogEvent(channelId: string, windowId: number): TPromise<void> {
		const id = `${windowId}:${channelId}`;
		if (!this.registry.has(id)) {
			return null;
		}
		return this.registry.get(id).stop();
	}
}

registerMainSingleton(IMainChannelLogService, MainChannelLogService);
