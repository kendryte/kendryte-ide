import { ILogService } from 'vs/platform/log/common/log';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { TPromise } from 'vs/base/common/winjs.base';

export interface LogEvent {
	level: keyof IChannelLogger;
	message: string;
	args: any[];
}

export interface IChannelLogService {
	_serviceBrand: any;

	closeChannel(channel: string): void;
	createChannel(name: string, id?: string, log?: boolean, file?: URI): IChannelLogger;
	show(channel: string, preserveFocus?: boolean): TPromise<void>;
}

export const IChannelLogService = createDecorator<IChannelLogService>('channelLogService');

export interface IChannelLogger extends ILogService {
	readonly id: string;

	clear(): void;
	log(message: string, ...args: any[]): void;
	write(message: string, ...args: any[]): void;
	writeln(message: string): void;
}
