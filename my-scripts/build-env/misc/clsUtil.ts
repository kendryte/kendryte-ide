import { Writable } from 'stream';
import { shellExec, shellExecAsync } from '../childprocess/noDependency';
import { isWin } from './constants';

export function cleanScreen() {
	if (isWin) {
		shellExec('[System.Console]::Clear()');
		process.stderr.write('\x1Bc\r');
	} else {
		process.stderr.write('\x1Bc\r');
	}
}

const clearSequence = Buffer.from('\x1Bc');

class ClearScreenStream extends Writable {
	_write(data: Buffer, encoding: string, callback: (e?: Error) => void) {
		const hasClear = data.indexOf(clearSequence);
		if (hasClear === -1) {
			process.stderr.write(data as any, encoding, callback);
		} else {
			shellExecAsync('[System.Console]::Clear()').catch().then(() => {
				process.stderr.write(data.slice(hasClear) as any, encoding, callback);
			});
		}
	}
}

export function getCleanableStdout(): Writable {
	if (isWin && process.stderr.isTTY) {
		return new ClearScreenStream();
	} else {
		return process.stderr;
	}
}
