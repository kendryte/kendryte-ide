import { buffer, Emitter } from 'vs/base/common/event';
import { IChannelLogger, LogEvent } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { LogLevel } from 'vs/platform/log/common/log';

export class RemoteLogger implements IChannelLogger {
	_serviceBrand: any;

	private readonly _onDidChangeLogLevel = new Emitter<LogLevel>();
	public readonly onDidChangeLogLevel = buffer(this._onDidChangeLogLevel.event);

	private readonly onOutput = new Emitter<LogEvent>();
	public readonly event = buffer(this.onOutput.event);
	private level: LogLevel;

	constructor(
		public readonly id: string,
	) { }

	stop() {
		this._onDidChangeLogLevel.dispose();
		this.onOutput.dispose();
		this.onOutput.fire = () => {
			throw new Error('this channel has stopped.');
		};
	}

	dispose() {
		throw new Error('Cannot dispose remote logger. you must do this on render process.');
	}

	public log(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'log', message, args });
	}

	public write(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'write', message, args });
	}

	public trace(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'trace', message, args });
	}

	public debug(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'debug', message, args });
	}

	public info(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'info', message, args });
	}

	public warn(message: string, ...args: any[]): void {
		this.onOutput.fire({ level: 'warn', message, args });
	}

	public error(message: string | Error, ...args: any[]): void {
		if (message instanceof Error) {
			message = message.stack;
		}
		this.onOutput.fire({ level: 'error', message, args });
	}

	public critical(message: string | Error, ...args: any[]): void {
		if (message instanceof Error) {
			message = message.stack;
		}
		this.onOutput.fire({ level: 'critical', message, args });
	}

	public getLevel(): LogLevel {
		return this.level;
	}

	public setLevel(level: LogLevel): void {
		this.level = level;
	}
}
