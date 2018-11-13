import { OutputStreamControl } from '@gongt/stillalive';
import { PassThrough } from 'stream';
import { spawnWithLog } from '../misc/globalOutput';
import { BlackHoleStream, CollectingStream, endArg } from '../misc/streamUtil';
import { mergeEnv } from './env';
import { parseCommand, processPromise } from './handlers';

interface ProcessHandler {
	output: NodeJS.ReadableStream;
	wait(): Promise<void>;
}

export async function pipeCommandBoth(
	stdout: NodeJS.WritableStream,
	stderr: NodeJS.WritableStream,
	cmd: string,
	...args: string[]
): Promise<void> {
	const cp = spawnWithLog(cmd, args, {
		stdio: ['ignore', 'pipe', 'pipe'],
		...mergeEnv(),
	});
	
	cp.stdout.pipe(stdout, {end: true});
	cp.stderr.pipe(stderr, endArg(stderr));
	
	const [command, argumentList] = parseCommand(cmd, args);
	return processPromise(cp, [command, argumentList]);
}

export async function muteCommandOut(cmd: string, ...args: string[]): Promise<void> {
	return pipeCommandOut(new BlackHoleStream(), cmd, ...args);
}

export async function pipeCommandOut(pipe: NodeJS.WritableStream, cmd: string, ...args: string[]): Promise<void> {
	// console.log(' + %s %s | line-output', command, argumentList.join(' '));
	const stream = _spawnCommand(cmd, args);
	if (pipe instanceof OutputStreamControl) {
		(pipe as OutputStreamControl).empty(`Running command: ${cmd} ${args.join(' ')}`);
	}
	stream.output.pipe(pipe, endArg(pipe));
	await stream.wait();
}

export async function getOutputCommand(cmd: string, ...args: string[]): Promise<string> {
	// console.log(' + %s %s | stream-output', command, argumentList.join(' '));
	const stream = _spawnCommand(cmd, args);
	const collector = new CollectingStream();
	stream.output.pipe(collector);
	await stream.wait();
	return collector.getOutput().trim();
}

function _spawnCommand(cmd: string, args: string[]): ProcessHandler {
	const output = new PassThrough();
	return {
		output,
		wait() {
			const cp = spawnWithLog(cmd, args, {
				stdio: ['ignore', 'pipe', 'pipe'],
				...mergeEnv(),
			});
			
			cp.stdout.pipe(output, {end: false});
			cp.stderr.pipe(output, {end: false});
			
			cp.on('exit', () => {
				output.end();
			});
			
			const [command, argumentList] = parseCommand(cmd, args);
			return processPromise(cp, [command, argumentList]);
		},
	};
}
