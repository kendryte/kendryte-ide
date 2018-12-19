import { Writable } from 'stream';
import { shellExec, shellExecAsync } from '../childprocess/simple';
import { isWin } from './constants';

export function cleanScreen() {
	if (process.env.BS_RUN_SCRIPT) {
		return;
	}
	if (isWin) {
		shellExec('[System.Console]::Clear()');
		process.stdout.write('\x1Bc\r');
	} else {
		process.stdout.write('\x1Bc\r');
	}
}

const clearSequence = Buffer.from('\x1Bc');

class ClearScreenStream extends Writable {
	_write(data: Buffer, encoding: string, callback: (e?: Error) => void) {
		const hasClear = data.indexOf(clearSequence);
		if (hasClear === -1) {
			process.stdout.write(data as any, encoding, callback);
		} else {
			shellExecAsync('[System.Console]::Clear()').catch().then(() => {
				process.stderr.write(data.slice(hasClear) as any, encoding, callback);
			});
		}
	}
}

export function getCleanableStdout(): NodeJS.WritableStream {
	if (isWin && process.stdout.isTTY) {
		return new ClearScreenStream();
	} else {
		return process.stdout;
	}
}
