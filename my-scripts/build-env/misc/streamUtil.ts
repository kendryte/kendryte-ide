import { resolve } from 'path';
import { Transform, Writable } from 'stream';
import { VSCODE_ROOT } from './constants';
import { yarnPackageDir } from './pathUtil';

export class CollectingStream extends Writable {
	private buffer = '';
	
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

const MODULES_ROOT1 = resolve(VSCODE_ROOT, 'node_modules');
const MODULES_ROOT2 = resolve(yarnPackageDir('devDependencies'), 'node_modules');
const toReplaceRoot = new RegExp(escapeRegExpCharacters(VSCODE_ROOT.replace(winSep, posixSep)), 'g');
const toReplaceModule1 = new RegExp(escapeRegExpCharacters(MODULES_ROOT1.replace(winSep, posixSep)), 'g');
const toReplaceModule2 = new RegExp(escapeRegExpCharacters(MODULES_ROOT2.replace(winSep, posixSep)), 'g');

export class TypescriptCompileOutputStream extends Transform {
	_transform(buff: Buffer, encoding: string, callback: Function) {
		if (!encoding) {
			encoding = 'utf8';
		} else if (encoding === 'buffer') {
			encoding = 'utf8';
		}
		let str = buff.toString(encoding);
		str = str.replace(toReplaceRoot, '.');
		str = str.replace(toReplaceModule1, '[NM]');
		str = str.replace(toReplaceModule2, '[NM]');
		this.push(str, encoding);
		callback();
	}
}