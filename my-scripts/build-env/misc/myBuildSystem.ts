import { createReadStream, createWriteStream, ftruncateSync, openSync, ReadStream, WriteStream } from 'fs';
import { resolve } from 'path';
import { RELEASE_ROOT } from './constants';
import { mkdirpSync } from './fsUtil';
import { currentCommand, WIT } from './help';
import { streamPromise } from './streamUtil';
import { timeout } from './timeUtil';

export interface DisposeFunction {
	(e?: Error): void;
}

const disposeList: DisposeFunction[] = [];

export function mainDispose(dispose: DisposeFunction) {
	disposeList.push(dispose);
}

let finalPromise: Promise<void|number> = new Promise((resolve, reject) => {
	setImmediate(resolve);
});

const knownProxyVar = [
	'HTTP_PROXY',
	'HTTPS_PROXY',
	'ALL_PROXY',
	'NO_PROXY',
	'FORCE_PROXY',
];
for (const i of Object.keys(process.env)) {
	if (knownProxyVar.includes(i)) {
		continue;
	}
	if (i.toUpperCase().endsWith('_PROXY')) {
		console.error('Warn: environment variable %s is ignored.', i);
		delete process.env[i];
	}
}

export function preventProxy() {
	const proxy = process.env.FORCE_PROXY || '';
	if (proxy) {
		process.env.HTTP_PROXY = process.env.HTTPS_PROXY = process.env.ALL_PROXY = proxy;
	} else {
		delete process.env.HTTP_PROXY;
		delete process.env.HTTPS_PROXY;
		delete process.env.ALL_PROXY;
		delete process.env.FORCE_PROXY;
	}
}

export function runMain(main: () => Promise<void|number>) {
	if (WIT()) {
		return;
	}
	const p = finalPromise = finalPromise.then(main);
	p.then((exitCode) => {
		if (exitCode) {
			return exitCode;
		}
		return 0;
	}, async (e) => {
		if (e.__programError) {
			console.error(
				'\n\n\x1B[38;5;9mCommand Failed: child process die\n\t%s\x1B[0m\n  Working Directory: %s\n  Program is:\n%s',
				e.message,
				e.__cwd,
				e.__program.replace(/^/mg, '    '),
			);
		} else {
			console.error('\n\n\x1B[38;5;9mCommand Failed: %s\x1B[0m', e? e.stack || e.message || e : 'Unknown error');
		}
		return 1;
	}).then(async (quit) => {
		if (finalPromise !== p) {
			return;
		}
		while (disposeList.length) {
			await disposeList.shift()();
			await timeout(50); // give time to finish
		}
		await timeout(300);
		console.error('\x1B[38;5;14m' + currentCommand().file + ' exit with code ' + quit + '\x1B[0m');
		process.exit(quit);
	}).catch((e) => {
		console.error(e);
		console.error('\x1B[38;5;14m' + currentCommand().file + ' error with code 1\x1B[0m');
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
		return streamPromise(stream);
	});
	return stream;
}

export function readFileStream(file): ReadStream {
	const fd = openSync(file, 'r+');
	const stream = createReadStream(file, {encoding: 'utf8', fd});
	mainDispose((error: Error) => {
		stream.close();
		return streamPromise(stream);
	});
	return stream;
}
