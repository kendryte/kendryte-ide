import { ILocalOptions, serialPortEOL } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindow';
import { Transform } from 'stream';
import { isUndefinedOrNull } from 'vs/base/common/types';

const escapeMap: { [id: string]: string } = {
	/// https://en.wikipedia.org/wiki/Escape_sequences_in_C#Table_of_escape_sequences
	'a': Buffer.from('07', 'hex').toString('latin1'),
	'b': Buffer.from('08', 'hex').toString('latin1'),
	'f': Buffer.from('0C', 'hex').toString('latin1'),
	'n': Buffer.from('0A', 'hex').toString('latin1'),
	'r': Buffer.from('0D', 'hex').toString('latin1'),
	't': Buffer.from('09', 'hex').toString('latin1'),
	'v': Buffer.from('0B', 'hex').toString('latin1'),
	'\\': Buffer.from('5C', 'hex').toString('latin1'),
	'\'': Buffer.from('27', 'hex').toString('latin1'),
	'"': Buffer.from('22', 'hex').toString('latin1'),
	'?': Buffer.from('3F', 'hex').toString('latin1'),
	'e': Buffer.from('1B', 'hex').toString('latin1'),
};

/***
 * 用途：处理用户输入，处理后写入串口设备
 * handle input user
 */
abstract class UserInputStream extends Transform {
	protected term: OutputXTerminal;
	protected instance: NodeJS.WritableStream;

	constructor() {
		super({ objectMode: true });
	}

	end() {
		// can not end
		console.warn('end');
	}

	setTerminal(xterm: OutputXTerminal) {
		this.term = xterm;
	}

	pipe<T extends NodeJS.WritableStream>(instance: T): T {
		if (this.instance) {
			if (this.instance === instance) {
				console.warn('duplicate pipe');
				return instance;
			}
			super.unpipe();
		}
		// console.warn('pipe to ', instance);
		this.instance = instance;
		return super.pipe(instance);
	}

	unpipe<T extends NodeJS.WritableStream>(destination?: T) {
		if (destination && this.instance !== destination) {
			console.warn('duplicate unpipe');
			return this;
		}
		delete this.instance;
		return super.unpipe();
	}
}

export class UserTypeInputStream extends UserInputStream {
	private ending = '';
	private encoding: string = 'latin1';

	_transform(data: string, encoding: string, callback: Function) {
		data = data.replace(/\r/g, this.ending);

		const buff = Buffer.from(data, this.encoding);
		// console.log('transform type: %s (%s)', buff, this.encoding);
		this.push(buff);

		callback();
	}

	setOptions(options: ILocalOptions = {} as any) {
		if (options.inputCharset) {
			this.encoding = options.inputCharset;
		}
		if (options.lineEnding) {
			this.ending = serialPortEOL.getReq(options.lineEnding);
		}
		if (isUndefinedOrNull(this.ending)) {
			this.ending = '\n';
		}
		console.log(`[type] encoding=${this.encoding} | ending=${Buffer.from(this.ending).toString('hex')}`);
	}
}

export class UserLineInputStream extends UserInputStream {
	private ending = '';
	private encoding: string = 'latin1';
	private escape: boolean;
	private echo: boolean;

	_transform(data: string, encoding: string, callback: Function) {
		data = data.replace(/\x0a/g, this.ending);

		if (this.escape && data.length > 1) {
			try {
				data = data.replace(/\\u([0-9a-fA-F]{4})/g, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\U([0-9a-fA-F]{8})/ig, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\x([0-9a-f]{2})/ig, (m, code) => {
					return Buffer.from(code, 'hex').toString('latin1');
				}).replace(/\\([eabfnrtv\\'"?])/ig, (m, code) => {
					return escapeMap[code] || m;
				});
			} catch (e) {
				this.term.writeUser(this.instance, '\x1B[38;5;9m' + e.message + '\x1B[0m\r');
				return callback();
			}
		}

		if (this.echo) {
			this.term.writeUser(this.instance, data + this.ending);
		}

		const buff = Buffer.from(data + this.ending, this.encoding);
		// console.log('transform string: %s (%s)', buff, this.encoding);
		this.push(buff);

		callback();
	}

	setOptions(options: ILocalOptions = {} as any) {
		if (options.inputCharset) {
			this.encoding = options.inputCharset;
		}
		if (options.lineEnding) {
			this.ending = serialPortEOL.getReq(options.lineEnding);
		}
		if (isUndefinedOrNull(this.ending)) {
			this.ending = '\n';
		}
		if (options.escape) {
			this.escape = options.escape;
		}
		if (options.echo) {
			this.echo = options.echo;
		}
		console.log(`encoding=${this.encoding} | ending=${Buffer.from(this.ending).toString('hex')} | escape=${this.escape} | echo=${this.echo}`);
	}
}
