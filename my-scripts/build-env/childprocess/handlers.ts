import { ChildProcess } from 'child_process';
import { isWin } from '../misc/constants';
import { StatusCodeError } from './error';

/* No use any node_modules deps */

export function parseCommand(cmd: string, args: string[]): [string, string[]] {
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

export function promiseProcess(cp: ChildProcess) {
	return new Promise<void>((resolve, reject) => {
		cp.once('error', reject);
		cp.once('exit', (code: number, signal: string) => {
			const e = StatusCodeError(code, signal);
			if (e) {
				reject(e);
			} else {
				resolve();
			}
		});
	});
}