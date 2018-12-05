import { IDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { format } from 'util';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { Extensions, IOutputChannel, IOutputChannelRegistry } from 'vs/workbench/parts/output/common/output';
import { AbstractLogService, ILogService, LogLevel } from 'vs/platform/log/common/log';
import { Registry } from 'vs/platform/registry/common/platform';
import { Emitter } from 'vs/base/common/event';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

export class ChannelLogger extends AbstractLogService implements IChannelLogger, ILogService, IDisposable {
	public readonly id: string;
	_serviceBrand: any;

	private readonly _onDispose = new Emitter<void>();
	public readonly onDispose = this._onDispose.event;

	constructor(
		private readonly windowId: number,
		private readonly channel: IOutputChannel,
	) {
		super();

		this.channel = channel;
		this.id = this.channel.id;
		this._register(toDisposable(() => {
			this.channel.dispose();
			registry.removeChannel(this.channel.id);
			Object.assign(this, { channel: null });
		}));
	}

	public clear() {
		this.channel.clear();
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

	writeln(message: string): void {
		this.channel.append(message + '\n');
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

	serialize() {
		return {
			id: this.channel.id,
			window: this.windowId,
		};
	}

	dispose() {
		this._onDispose.fire();
		this._onDispose.dispose();
		return super.dispose();
	}
}
