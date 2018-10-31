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

export function chdir(d: string) {
	process.chdir(d);
	console.log(' > %s', process.cwd());
}

function StatusCodeError(status: number, signal: string): Error {
	if (status === 0 && !signal) {
		return null;
	}
	return new Error(
		signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	);
}

function parseCommand(cmd: string, args: string[]): [string, string[]] {
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

function shellSync(stdio: string | string[], cmd: string, args: string[]) {
	const r = spawnSync(cmd, args, {
		stdio,
		encoding: 'utf8',
	});
	if (r.error) {
		throw r.error;
	}
	ThrowStatusCodeError(r.status, r.signal);
	return r;
}

export function shellExec(cmd: string, ...args: string[]): void {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | pipe-output', cmd, args.join(' '));
	shellSync('inherit', cmd, args);
}

export function shellMute(cmd: string, ...args: string[]) {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | mute-output', cmd, args.join(' '));
	shellSync(['ignore', 'ignore', 'inherit'], cmd, args);
}

export function shellOutput(cmd: string, ...args: string[]): string {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | read-output', cmd, args.join(' '));
	const r = shellSync(['ignore', 'pipe', 'inherit'], cmd, args);
	return r.stdout;
}

interface ProcessHandler {
	output: Readable;
	wait(): Promise<void>;
}

export function outputCommand(cmd: string, ...args: string[]): ProcessHandler {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | stream-output', cmd, args.join(' '));
	const output = new Duplex();
	return {
		output,
		wait() {
			const cp = spawn(cmd, args, {
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
