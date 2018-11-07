import { ChildProcess, SpawnOptions } from 'child_process';
import { isWin } from '../misc/constants';
import { StatusCodeError } from './error';

/* No use any node_modules deps */

export type ProcessArgsInfo = [string, ReadonlyArray<string>];

export function parseCommand(cmd: string, args: ReadonlyArray<string>): [string, ReadonlyArray<string>] {
	if (!args) {
		args = [];
	}
	if (cmd === 'powershell.exe') {
		return [cmd, args];
	}
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

export function processPromise(cp: ChildProcess, cmd: ProcessArgsInfo, options?: SpawnOptions) {
	return new Promise<void>((resolve, reject) => {
		const cwd = (options && options.cwd)? options.cwd : process.cwd();
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