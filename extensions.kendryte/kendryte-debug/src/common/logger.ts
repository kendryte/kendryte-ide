import { format } from 'util';

export interface IMyLogger {
	write(data: string);
	writeln(data: string);
	info(msg: string, ...args: any[]);
	warn(msg: string, ...args: any[]);
	error(msg: string, ...args: any[]);
}

export abstract class NodeLoggerCommon implements IMyLogger {
	constructor(private readonly _tag: string) {
	}

	abstract write(data: string);

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
