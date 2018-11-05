import {
	existsSync,
	lstat as lstatAsync,
	lstatSync,
	mkdirSync,
	open as openAsync,
	readFile as readFileAsync,
	rmdir as rmdirAsync,
	Stats,
	unlink as unlinkAsync,
	writeFile as writeFileAsync,
} from 'fs';
import { resolve } from 'path';
import * as rimraf from 'rimraf';
import { Writable } from 'stream';
import { promisify } from 'util';

/* No use any node_modules deps */

export function mkdirpSync(p: string) {
	if (!p) {
		throw new Error('path must not empty string');
	}
	if (!existsSync(p)) {
		mkdirpSync(resolve(p, '..'));
		mkdirSync(p);
	}
}

export function isLinkSync(path: string) {
	try {
		return lstatSync(path).isSymbolicLink();
	} catch (e) {
	}
}

export async function isExists(path: string) {
	return !!await lstat(path);
}

export function isExistsSync(path: string): boolean {
	try {
		lstatSync(path);
		return true;
	} catch (e) {
		return false;
	}
}

export function lstat(p: string): Promise<Stats> {
	return new Promise((resolve, reject) => {
		lstatAsync(p, (err, stats) => {
			if (err && err.code !== 'ENOENT') {
				return reject(err);
			}
			return resolve(stats);
		});
	});
}

export const readFile = promisify(readFileAsync);
export const writeFile = promisify(writeFileAsync);
export const unlink = promisify(unlinkAsync);
export const rmdir = promisify(rmdirAsync);
export const open = promisify(openAsync);

function wrapFs(of: Function, output: Writable): Function {
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
			unlink: wrapFs(unlinkAsync, output) as typeof unlinkAsync,
			rmdir: wrapFs(rmdirAsync, output) as typeof rmdirAsync,
		}, wrappedCallback);
	});
}