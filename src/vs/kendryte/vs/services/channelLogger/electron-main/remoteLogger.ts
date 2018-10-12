import { buffer, Emitter } from 'vs/base/common/event';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';

export interface LogEvent {
	level: keyof IChannelLogger;
	message: string;
	args: any[];
}

export class RemoteLogger implements IChannelLogger {
	private readonly onOutput = new Emitter<LogEvent>();
	public readonly event = buffer(this.onOutput.event);

	constructor() {}

	stop() {
		this.onOutput.dispose();
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
}
