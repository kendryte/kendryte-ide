import { spawn, spawnSync, StdioOptions } from 'child_process';
import { mergeEnv } from './env';
import { ThrowStatusCodeError } from './error';
import { parseCommand, processPromise } from './handlers';

/* No use any node_modules deps */

function _shellSync(stdio: StdioOptions, cmd: string, args: string[]) {
	const r = spawnSync(cmd, args, {
		stdio,
		encoding: 'utf8',
		...mergeEnv(),
	});
	if (r.error) {
		throw r.error;
	}
	ThrowStatusCodeError(r.status, r.signal, [cmd, args, process.cwd()]);
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
		...mergeEnv(),
	});
	return processPromise(r, [cmd, args]);
}

export function shellOutput(cmd: string, ...args: string[]): string {
	[cmd, args] = parseCommand(cmd, args);
	console.log(' + %s %s | read-output', cmd, args.join(' '));
	const r = _shellSync(['ignore', 'pipe', 'ignore'], cmd, args);
	return r.stdout;
}
