import { format } from 'util';
import { DebugSession, Event } from 'vscode-debugadapter';

export class CustomEvent<T = any> extends Event {
	constructor(type: string, body: T) {
		super('custom', {
			type,
			body,
		});
	}
}

export class CustomLogger {
	constructor(
		private readonly _tag: string,
		private readonly session: DebugSession,
	) {
	}

	write(data: string) {
		this.session.sendEvent(new CustomEvent('log', { data }));
		console.error('!!! ', data);
	}

	writeln(data: string) {
		this.write(this.tag(data) + '\n');
	}

	info(msg: string, ...args: any[]) {
		if (args.length) {
			this.writeln(format(msg, ...args));
		} else {
			this.writeln(msg);
		}
	}

	warn(msg: string, ...args: any[]) {
		if (args.length) {
			this.writeln(format(msg, ...args));
		} else {
			this.writeln(msg);
		}
	}

	error(msg: string, ...args: any[]) {
		if (args.length) {
			this.writeln(format(msg, ...args));
		} else {
			this.writeln(msg);
		}
	}

	private tag(data: string) {
		return data.replace(/^/g, `[${this._tag}] `);
	}
}
