/* No use any node_modules deps */

import { closeSync, createReadStream, createWriteStream, ftruncateSync, openSync, ReadStream, WriteStream } from 'fs';
import { resolve } from 'path';
import { RELEASE_ROOT } from './constants';
import { mkdirpSync } from './fsUtil';
import { WIT } from './help';

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
	if (WIT()) {
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

export function useWriteFileStream(file: string): WriteStream {
	file = resolve(RELEASE_ROOT, file);
	mkdirpSync(resolve(file, '..'));
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
