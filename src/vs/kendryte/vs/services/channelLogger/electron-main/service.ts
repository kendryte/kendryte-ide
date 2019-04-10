import { IChannelLogger, LogEvent } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { Disposable } from 'vs/base/common/lifecycle';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { RemoteLogger } from 'vs/kendryte/vs/services/channelLogger/electron-main/remoteLogger';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';

export interface IMainChannelLogService {
	_serviceBrand: any;

	receive(channelId: string, windowId: number): IChannelLogger;
	_handleLogEvent(channelId: string, windowId: number): Event<LogEvent>;
	_handleStopLogEvent(channelId: string, windowId: number): Promise<void>;
}

export const IMainChannelLogService = createDecorator<IMainChannelLogService>('mainChannelLogService');

class MainChannelLogService extends Disposable implements IMainChannelLogService {
	_serviceBrand: any;

	private readonly registry = new ExtendMap<string, RemoteLogger>();

	constructor() {
		super();
	}

	receive(channelId: string, windowId: number): RemoteLogger {
		return this.registry.entry(`${windowId}:${channelId}`, (id) => {
			return new RemoteLogger(id);
		});
	}

	_handleLogEvent(channelId: string, windowId: number): Event<LogEvent> {
		return this.receive(channelId, windowId).event;
	}

	async _handleStopLogEvent(channelId: string, windowId: number): Promise<void> {
		const id = `${windowId}:${channelId}`;
		if (!this.registry.has(id)) {
			return;
		}
		return this.registry.getReq(id).stop();
	}
}

registerMainSingleton(IMainChannelLogService, MainChannelLogService);
