import { AbstractLogService, ILogService, LogLevel } from 'vs/platform/log/common/log';
import { Extensions, IOutputChannel, IOutputChannelDescriptor, IOutputChannelRegistry, IOutputService } from 'vs/workbench/parts/output/common/output';
import { format } from 'util';
import { Registry } from 'vs/platform/registry/common/platform';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable, IDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

export interface IChannelLogger extends ILogService {
	log(message: string, ...args: any[]): void;

	write(message: string, ...args: any[]): void;

	show(preserveFocus?: boolean);

	show(): void;
}

export interface IChannelLogService {
	_serviceBrand: any;

	createChannel(channel: IOutputChannelDescriptor): IChannelLogger;

	show(channel: IChannelLogger, preserveFocus?: boolean);
}

class ChannelLogger extends AbstractLogService implements IChannelLogger, IDisposable {
	_serviceBrand: any;

	constructor(
		private readonly channel: IOutputChannel,
		private readonly outputService: IOutputService,
	) {
		super();
		this.channel = channel;
		this._register(toDisposable(() => {
			this.channel.dispose();
			registry.removeChannel(this.channel.id);
			Object.assign(this, { channel: null });
		}));
	}

	show(preserveFocus?: boolean) {
		this.outputService.showChannel(this.channel.id);
	}

	public println(level: string, _colorTheme: string, message: string, ...args: any[]) {
		this.channel.append(format(`[${level}] ${message}`, ...args) + '\n');
	}

	log(message: string, ...args: any[]): void {
		this.channel.append(format(message, ...args) + '\n');
	}

	write(message: string, ...args: any[]): void {
		this.channel.append(format(message, ...args));
	}

	trace(message: string, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Trace) {
			this.println('TRACE', 'color: #888', message, ...args);
		}
	}

	debug(message: string, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Debug) {
			this.println('DEBUG', 'background: #eee; color: #888', message, ...args);
		}
	}

	info(message: string, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Info) {
			this.println(' INFO', 'color: #33f', message, ...args);
		}
	}

	warn(message: string | Error, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Warning) {
			if (message instanceof Error) {
				message = message.stack;
			}
			this.println(' WARN', 'color: #993', message, ...args);
		}
	}

	error(message: string, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Error) {
			this.println('  ERR', 'color: #f33', message, ...args);
		}
	}

	critical(message: string, ...args: any[]): void {
		if (this.getLevel() <= LogLevel.Critical) {
			this.println('CRITI', 'background: #f33; color: white', message, ...args);
		}
	}
}

class ChannelLogService extends Disposable implements IChannelLogService {
	_serviceBrand: any;

	constructor(
		@IOutputService private outputService: IOutputService,
	) {
		super();
	}

	public createChannel(channel: IOutputChannelDescriptor): IChannelLogger {
		registry.registerChannel(channel);
		const newItem = new ChannelLogger(this.outputService.getChannel(channel.id), this.outputService);
		this._register(newItem);
		return newItem;
	}

	show(channel: IChannelLogger, preserveFocus?: boolean) {
		channel.show(preserveFocus);
	}
}

export const IChannelLogService = createDecorator<IChannelLogService>('IChannelLogService');

registerSingleton(IChannelLogService, ChannelLogService);