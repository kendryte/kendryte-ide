import { DuplexControl, startWorking } from '@gongt/stillalive';
import { createWriteStream, existsSync, rmdir, unlink, unlinkSync } from 'fs';
import * as rimraf from 'rimraf';
import { PassThrough, Writable } from 'stream';
import { chdir, pipeCommandOut } from './childCommands';
import { mainDispose } from './include';

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

export async function installDependency(output: Writable, dir?: string): Promise<void> {
	if (dir) {
		chdir(dir);
	}
	
	const tee = new PassThrough();
	tee.pipe(output, {end: false});
	tee.pipe(createWriteStream('yarn-install.log'));
	
	if (existsSync('yarn-error.log')) {
		unlinkSync('yarn-error.log');
	}
	tee.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
	await pipeCommandOut(tee, 'yarn', 'install', '--verbose');
}

export function timing() {
	const date = new Date;
	
	return function () {
		const t = (Date.now() - date.getTime()) / 1000;
		return ` (in ${t.toFixed(2)} sec)`;
	};
}

function wrapFs<T extends Function>(of: T, output: Writable): T {
	return ((...args) => {
		output.write(`${of.name}: ${args[0]}\n`);
		return of.apply(undefined, args);
	}) as any;
}

export function removeDirecotry(path: string, output: Writable) {
	return new Promise<void>((resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : resolve();
		
		rimraf(path, {
			maxBusyTries: 5,
			emfileWait: true,
			disableGlob: true,
			unlink: wrapFs<any>(unlink, output),
			rmdir: wrapFs<any>(rmdir, output),
		}, wrappedCallback);
	});
}