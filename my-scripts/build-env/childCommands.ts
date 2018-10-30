import { spawn, spawnSync } from 'child_process';
import { Duplex, Readable } from 'stream';
import { isWin } from './include';

function ThrowStatusCodeError(status: number, signal: string): never | void {
	const e = StatusCodeError(status, signal);
	if (e) {
		throw e;
	}
	return;
}

function StatusCodeError(status: number, signal: string): Error {
	if (status === 0 && !signal) {
		return null;
	}
	new Error(
		signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	);
}

function parseCommand(cmd: string, args: string[]) {
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

export function execCommand(cmd: string, ...args: string[]): void {
	console.log(' + %s %s', cmd, args.join(' '));
	[cmd, args] = parseCommand(cmd, args);
	const r = spawnSync(cmd, args, {
		stdio: 'inherit',
		encoding: 'utf8',
	});
	if (r.error) {
		throw r.error;
	}
	ThrowStatusCodeError(r.status, r.signal);
}

export async function simpleOutput(cmd: string): Promise<string> {
	const [_cmd, args] = parseCommand(cmd, []);
	return spawn(_cmd, args, {
		stdio: ['inherit','pipe',''],
		encoding: 'utf8',
	});
}

interface ProcessHandler {
	output: Readable;
	wait(): Promise<void>;
}

export function outputCommand(exec: string, ...args: string[]): ProcessHandler {
	const output = new Duplex();
	return {
		output,
		wait() {
			const cp = spawn(exec, args, {
				stdio: ['ignore', output, output],
			});

			return new Promise((resolve, reject) => {
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
		},
	};
}
