import { spawn, SpawnOptions } from 'child_process';
import { format } from 'util';
import { ProgramError } from '../childprocess/error';
import { parseCommand, processPromise } from '../childprocess/handlers';
/* No use any node_modules deps */

let globalLogTarget: NodeJS.WritableStream = process.stderr;

export function useThisStream(stream: NodeJS.WritableStream) {
	globalLogTarget = stream;
}

export function globalLog(msg: any, ...args: any[]) {
	globalLogTarget.write(format(msg + '\n', ...args));
}

export function globalInterruptLog(msg: any, ...args: any[]) {
	if (globalLogTarget['nextLine']) {
		globalLogTarget.write('\n' + format(msg + '\n', ...args));
		globalLogTarget['nextLine']();
	} else {
		globalLogTarget.write(format(msg + '\n', ...args));
	}
}

export function spawnWithLog(command: string, args?: ReadonlyArray<string>, options?: SpawnOptions) {
	globalInterruptLog(' + %s %s', command, args.join(' '));
	
	[command, args] = parseCommand(command, args);
	const r = spawn(command, args, options);
	
	processPromise(r, [command, args], options).then(() => {
		globalLog('Command %s success.', command);
	}, (e: ProgramError) => {
		globalLog(
			'Command [%s] [%s]\n  Failed with error: code = %s, signal = %s\n%s',
			command, args.join('] ['),
			e.status, e.signal, e.stack);
	});
	
	return r;
}

export function indentArgs(args: ReadonlyArray<string>) {
	return args.map((arg, index) => {
		return `  Argument[${index}] = ${arg}`;
	}).join('\n');
}
