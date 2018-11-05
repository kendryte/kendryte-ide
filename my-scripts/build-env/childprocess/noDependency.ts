import { spawn, spawnSync, StdioOptions } from 'child_process';
import { StatusCodeError, ThrowStatusCodeError } from './error';
import { parseCommand } from './handlers';

/* No use any node_modules deps */

function _shellSync(stdio: StdioOptions, cmd: string, args: string[]) {
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
	_shellSync('inherit', cmd, args);
}

export function shellExecAsync(cmd: string, ...args: string[]): Promise<void> {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | pipe-output', cmd, args.join(' '));
	const r = spawn(cmd, args, {
		stdio: 'inherit',
	});
	return new Promise((resolve, reject) => {
		const wrappedCallback = (err, data) => err? reject(err) : resolve(data);

		r.on('error', (e) => {
			reject(e);
		});
		r.on('exit', (status: number, signal: string) => {
			const e = StatusCodeError(status, signal);
			if (e) {
				reject(e);
			} else {
				resolve();
			}
		});
	});
}

export function shellOutput(cmd: string, ...args: string[]): string {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | read-output', cmd, args.join(' '));
	const r = _shellSync(['ignore', 'pipe', 'ignore'], cmd, args);
	return r.stdout;
}
