import { AbstractLogService, ILogService, LogLevel } from 'vs/platform/log/common/log';
import { Extensions, IOutputChannel, IOutputChannelRegistry, IOutputService } from 'vs/workbench/parts/output/common/output';
import { format } from 'util';
import { Registry } from 'vs/platform/registry/common/platform';

const registry = Registry.as<IOutputChannelRegistry>(Extensions.OutputChannels);

export interface IConsoleLogService extends ILogService {
	log(message: string, ...args: any[]): void;

	write(message: string, ...args: any[]): void;
}

export class ChannelLogService extends AbstractLogService implements IConsoleLogService {
	_serviceBrand: any;

	private channel: IOutputChannel;

	constructor(
		public readonly id: string,
		name: string,
		@IOutputService private outputService: IOutputService,
	) {
		super();
		registry.registerChannel(id, name);
		this.channel = outputService.getChannel(id);
		this._register(this.channel);
		this._register({
			dispose() {
				registry.removeChannel(id);
			},
		});
	}

	public println(level: string, _colorTheme: string, message: string, ...args: any[]) {
		this.channel.append(format(`[${level}] ${message}\n`, ...args));
	}

	show(preserveFocus?: boolean) {
		return this.outputService.showChannel(this.id, preserveFocus);
	}

	log(message: string, ...args: any[]): void {
		this.channel.append(format(`${message}\n`, ...args));
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