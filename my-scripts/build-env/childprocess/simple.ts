import { spawn, spawnSync, StdioOptions } from 'child_process';
import { mergeEnv } from './env';
import { ThrowStatusCodeError } from './error';
import { parseCommand, processPromise } from './handlers';

function _shellSync(stdio: StdioOptions, cmd: string, args: ReadonlyArray<string>) {
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
	const [command, argumentList] = parseCommand(cmd, args);
	console.log(' + %s %s | pipe-output', command, argumentList.join(' '));
	_shellSync('inherit', command, argumentList);
}

export function shellExecAsync(cmd: string, ...args: string[]): Promise<void> {
	const [command, argumentList] = parseCommand(cmd, args);
	console.log(' + %s %s | pipe-output', command, argumentList.join(' '));
	const r = spawn(command, argumentList, {
		stdio: 'inherit',
		...mergeEnv(),
	});
	return processPromise(r, [command, argumentList]);
}

export function shellOutput(cmd: string, ...args: string[]): string {
	const [command, argumentList] = parseCommand(cmd, args);
	console.log(' + %s %s | read-output', command, argumentList.join(' '));
	const r = _shellSync(['ignore', 'pipe', 'ignore'], command, argumentList);
	return r.stdout;
}
