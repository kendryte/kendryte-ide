/* No use any node_modules deps */

import { DuplexControl, startWorking } from '@gongt/stillalive';
import { closeSync, createReadStream, createWriteStream, ftruncateSync, openSync, ReadStream, WriteStream } from 'fs';

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

export function runMain(main: () => Promise<void>) {
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
			console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.message);
		} else {
			console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.stack);
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

export function usePretty(): DuplexControl {
	const stream = startWorking();
	mainDispose((error: Error) => {
		if (error) {
			stream.fail(error.message);
		}
		stream.end();
	});
	return stream;
}

export function writeFileStream(file): WriteStream {
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
