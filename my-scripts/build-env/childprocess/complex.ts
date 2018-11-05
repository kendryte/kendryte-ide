import { spawn } from 'child_process';
import { PassThrough, Readable, Writable } from 'stream';
import { BlackHoleStream, CollectingStream } from '../misc/streamUtil';
import { parseCommand, promiseProcess } from './handlers';

interface ProcessHandler {
	output: Readable;
	wait(): Promise<void>;
}

export async function muteCommandOut(cmd: string, ...args: string[]): Promise<void> {
	return pipeCommandOut(new BlackHoleStream(), cmd, ...args);
}

export async function pipeCommandOut(pipe: Writable, cmd: string, ...args: string[]): Promise<void> {
	[cmd, args] = parseCommand(cmd, args);
	// console.log(' + %s %s | line-output', cmd, args.join(' '));
	const stream = _spawnCommand(cmd, args);
	stream.output.pipe(pipe);
	await stream.wait();
}

export async function getOutputCommand(cmd: string, ...args: string[]): Promise<string> {
	[cmd, args] = parseCommand(cmd, args);
	// console.log(' + %s %s | stream-output', cmd, args.join(' '));
	const stream = _spawnCommand(cmd, args);
	const collector = new CollectingStream();
	stream.output.pipe(collector);
	await stream.wait();
	return collector.getOutput();
}

function _spawnCommand(cmd: string, args: string[]): ProcessHandler {
	const output = new PassThrough();
	return {
		output,
		wait() {
			const cp = spawn(cmd, args, {
				stdio: ['ignore', 'pipe', 'pipe'],
			});
			
			cp.stdout.pipe(output, {end: false});
			cp.stderr.pipe(output, {end: false});
			
			cp.on('exit', () => {
				output.end();
			});
			
			return promiseProcess(cp);
		},
	};
}
