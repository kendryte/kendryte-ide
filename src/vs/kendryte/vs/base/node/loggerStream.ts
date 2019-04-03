import { Transform } from 'stream';

export type LogFunction = (message: string, ...args: any[]) => void;

export class LoggerStream extends Transform {
	private prefix: string;

	constructor(
		private readonly logFn: LogFunction,
		prefix?: string,
	) {
		super();
		this.prefix = prefix ? prefix + ' %s' : '%s';
	}

	_transform(chunk: Buffer, encoding: string, callback: Function): void {
		if (encoding === 'buffer') {
			encoding = undefined as any;
		}
		chunk.toString(encoding).split(/\n/g).forEach((l) => {
			if (l.length) {
				this.logFn(this.prefix, l);
			}
		});
		this.push(chunk, encoding);
		callback();
	}
}
