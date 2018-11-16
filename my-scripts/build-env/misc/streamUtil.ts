import { resolve } from 'path';
import { Transform, Writable } from 'stream';
import { VSCODE_ROOT } from './constants';
import { globalInterruptLog, globalLog } from './globalOutput';
import { yarnPackageDir } from './pathUtil';

export class CollectingStream extends Writable {
	private buffer = '';
	private _promise: Promise<string>;
	
	constructor(sourceStream?: NodeJS.ReadableStream) {
		super();
		if (sourceStream) {
			sourceStream.pipe(this);
			sourceStream.on('error', (e) => {
				globalLog('[CollectingStream]: error passthru: ' + e.message);
				this.emit('error', e);
			});
		}
	}
	
	_write(chunk: Buffer, encoding: string, callback: (error?: Error|null) => void): void {
		if (!encoding) {
			encoding = 'utf8';
		} else if (encoding === 'buffer') {
			encoding = 'utf8';
		}
		this.buffer += chunk.toString(encoding);
		callback();
	}
	
	getOutput() {
		return this.buffer;
	}
	
	promise(): Promise<string> {
		return streamPromise(this).then(() => this.buffer);
	}
}

export class BlackHoleStream extends Writable {
	_write(chunk: Buffer, encoding: string, callback: (error?: Error|null) => void): void {
		callback();
	}
}

function escapeRegExpCharacters(value: string): string {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\[\]\(\)\#]/g, '\\$&');
}

const winSep = /\\/g;
const posixSep = '/';

const SOURCE_ROOT = resolve(VSCODE_ROOT, 'src').replace(winSep, posixSep);
const MODULES_ROOT1 = resolve(VSCODE_ROOT, 'node_modules').replace(winSep, posixSep);
const MODULES_ROOT2 = resolve(yarnPackageDir('devDependencies'), 'node_modules').replace(winSep, posixSep);

const toReplaceRoot = new RegExp(escapeRegExpCharacters(SOURCE_ROOT), 'g');
const toReplaceModule1 = new RegExp(escapeRegExpCharacters(MODULES_ROOT1), 'g');
const toReplaceModule2 = new RegExp(escapeRegExpCharacters(MODULES_ROOT2), 'g');

const toReplaceStart = /Starting (?:\x1B\[[\d;]+m)?compilation/mg;

export class TypescriptCompileOutputStream extends Transform {
	private passFirst = false;
	
	_transform(buff: Buffer, encoding: string, callback: Function) {
		if (!encoding) {
			encoding = 'utf8';
		} else if (encoding === 'buffer') {
			encoding = 'utf8';
		}
		let str = buff.toString(encoding);
		str = str.replace(toReplaceStart, (m0) => {
			if (this.passFirst) {
				return '\r\x1Bc' + m0;
			}
			this.passFirst = true;
			return m0;
		});
		str = str.replace(toReplaceModule1, '[NM]');
		str = str.replace(toReplaceModule2, '[NM]');
		str = str.replace(toReplaceRoot, '.');
		this.push(str, encoding);
		callback();
	}
}

export function streamHasEnd(S: NodeJS.ReadableStream|NodeJS.WritableStream) {
	const stream = S as any;
	return (stream._writableState && stream._writableState.ended) || (stream._readableState && stream._readableState.ended);
}

export function streamPromise(stream: NodeJS.ReadableStream|NodeJS.WritableStream): Promise<void> {
	if (streamHasEnd(stream)) {
		return Promise.resolve();
	} else {
		return new Promise((resolve, reject) => {
			stream.once('end', () => resolve());
			stream.once('finish', () => resolve());
			stream.once('close', () => resolve());
			stream.once('error', reject);
		});
	}
}

export function endArg(stream: NodeJS.WritableStream) {
	if (stream.hasOwnProperty('noEnd') || stream === process.stdout || stream === process.stderr) {
		return {end: false};
	} else {
		return {end: true};
	}
}
