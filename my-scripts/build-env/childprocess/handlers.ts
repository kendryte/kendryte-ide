import { ChildProcess } from 'child_process';
import { isWin } from '../misc/constants';
import { StatusCodeError } from './error';

/* No use any node_modules deps */

export type ProcessArgsInfo = [string, string[]];

export function parseCommand(cmd: string, args: string[]): [string, string[]] {
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

export function processPromise(cp: ChildProcess, cmd: ProcessArgsInfo) {
	return new Promise<void>((resolve, reject) => {
		const cwd = process.cwd();
		cp.once('error', reject);
		cp.once('exit', (code: number, signal: string) => {
			const e = StatusCodeError(code, signal, [cmd[0], cmd[1], cwd]);
			if (e) {
				reject(e);
			} else {
				resolve();
			}
		});
	});
}