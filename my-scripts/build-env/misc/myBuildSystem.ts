/* No use any node_modules deps */

import { MyOptions, OutputStreamControl, startWorking } from '@gongt/stillalive';
import { closeSync, createReadStream, createWriteStream, ftruncateSync, openSync, ReadStream, WriteStream } from 'fs';
import { basename } from 'path';
import { useThisStream } from './globalOutput';

export interface DisposeFunction {
	(e?: Error): void;
}

const disposeList: DisposeFunction[] = [];

export function mainDispose(dispose: DisposeFunction) {
	disposeList.push(dispose);
}

let finalPromise: Promise<void> = new Promise((resolve, reject) => {
	setImmediate(resolve);
});

function wit() {
	return process.argv.includes('--what-is-this');
}

export function helpTip(cmd: string, msg: string) {
	console.log('\x1B[48;5;0;1m * \x1B[38;5;14m%s\x1B[0;48;5;0m - %s.', cmd, msg);
}

export function whatIsThis(self: string, title: string) {
	if (wit()) {
		helpTip(basename(self, '.js'), title);
	}
}

export function runMain(main: () => Promise<void>) {
	if (wit()) {
		return;
	}
	const p = finalPromise = finalPromise.then(main);
	p.then(() => {
		if (finalPromise !== p) {
			return;
		}
		disposeList.forEach((cb) => {
			cb();
		});
	}, (e) => {
		if (e.__programError) {
			console.error(
				'\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m\n  Working Directory: %s\n  Program is:\n%s',
				e.message,
				e.__cwd,
				e.__program.replace(/^/mg, '    '),
			);
		} else {
			console.error('\n\n\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
		}
		disposeList.forEach((cb) => {
			cb(e);
		});
	}).then(() => {
		if (finalPromise !== p) {
			return;
		}
		process.exit(0);
	}, () => {
		process.exit(1);
	});
}

useThisStream(process.stderr);

export function usePretty(opts?: MyOptions): OutputStreamControl {
	const stream = startWorking();
	useThisStream(stream);
	Object.assign(stream, {noEnd: true});
	mainDispose((error: Error) => {
		useThisStream(process.stderr);
		if (error) {
			stream.fail(error.message);
		}
		stream.end();
	});
	return stream;
}

export function useWriteFileStream(file: string): WriteStream {
	const fd = openSync(file, 'w');
	ftruncateSync(fd);
	const stream = createWriteStream(file, {encoding: 'utf8', fd});
	mainDispose((error: Error) => {
		stream.end();
		closeSync(fd);
	});
	return stream;
}

export function readFileStream(file): ReadStream {
	const fd = openSync(file, 'r+');
	const stream = createReadStream(file, {encoding: 'utf8', fd});
	mainDispose((error: Error) => {
		stream.close();
		closeSync(fd);
	});
	return stream;
}
