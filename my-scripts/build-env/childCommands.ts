import { ChildProcess, spawn, spawnSync, StdioOptions } from 'child_process';
import { normalize } from 'path';
import { Readable, Transform, Writable } from 'stream';
import { isWin } from './include';

function ThrowStatusCodeError(status: number, signal: string): never|void {
	const e = StatusCodeError(status, signal);
	if (e) {
		throw e;
	}
	return;
}

export function chdir(d: string) {
	d = normalize(d);
	process.chdir(d);
	console.log('\n > %s', process.cwd());
}

function StatusCodeError(status: number, signal: string): Error {
	if (status === 0 && !signal) {
		return null;
	}
	return new Error(
		signal? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`,
	);
}

function parseCommand(cmd: string, args: string[]): [string, string[]] {
	if (isWin) {
		return ['powershell.exe', ['-Command', cmd, ...args]];
	} else {
		return [cmd, args];
	}
}

function shellSync(stdio: StdioOptions, cmd: string, args: string[]) {
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

export async function pipeCommandOut(pipe: Writable, cmd: string, ...args: string[]): Promise<void> {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | line-output', cmd, args.join(' '));
	const cp = spawn(cmd, args, {
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	cp.stdout.pipe(pipe, {end: false});
	await promiseProcess(cp);
}

class PassThru extends Transform {
	public _transform(chunk: any, encoding: string, callback: Function): void {
		this.push(chunk, encoding);
		callback();
	}
}

export function outputCommand(cmd: string, ...args: string[]): ProcessHandler {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | stream-output', cmd, args.join(' '));
	const output = new PassThru();
	return {
		output,
		wait() {
			const cp = spawn(cmd, args, {
				stdio: ['ignore', output, output],
			});
			return promiseProcess(cp);
		},
	};
}

function promiseProcess(cp: ChildProcess) {
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