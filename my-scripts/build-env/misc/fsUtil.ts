import {
	existsSync,
	lstat as lstatAsync,
	lstatSync,
	mkdirSync,
	open as openAsync,
	readFile as readFileAsync,
	rename as renameAsync,
	rmdir as rmdirAsync,
	Stats,
	unlink as unlinkAsync,
	writeFile as writeFileAsync,
} from 'fs';
import { resolve } from 'path';
import * as rimraf from 'rimraf';
import { promisify } from 'util';
import { isMac, isWin, VSCODE_ROOT } from './constants';
import { timeout } from './timeUtil';

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

export function readFile(path: string): Promise<string> {
	return new Promise((resolve, reject) => {
		readFileAsync(path, 'utf8', (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export function writeFile(path: string, data: Buffer|string): Promise<void> {
	return new Promise((resolve, reject) => {
		writeFileAsync(path, data, 'utf8', (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export const unlink = promisify(unlinkAsync);
export const rmdir = promisify(rmdirAsync);
export const open = promisify(openAsync);
export const rename = promisify(renameAsync);

function wrapFs(of: Function, output: NodeJS.WritableStream): Function {
	return ((...args) => {
		output.write(`${of.name}: ${args[0]}\n`);
		return of.apply(undefined, args);
	}) as any;
}

export function removeDirectory(path: string, output: NodeJS.WritableStream, verbose = true) {
	output.write(`removing directory: ${path}...\n`);
	let p = new Promise<void>((resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : resolve();
		
		rimraf(path, {
			maxBusyTries: 5,
			emfileWait: true,
			disableGlob: true,
			unlink: verbose? wrapFs(unlinkAsync, output) as typeof unlinkAsync : unlinkAsync,
			rmdir: verbose? wrapFs(rmdirAsync, output) as typeof rmdirAsync : rmdirAsync,
		}, wrappedCallback);
	});
	
	p = p.then(() => {
		output.write(`remove complete. delay for OS.\n`);
	});
	
	if (isWin) {
		p = p.then(() => timeout(5000));
	} else {
		p = p.then(() => timeout(500));
	}
	
	p = p.then(() => {
		output.write(`remove directory finish.\n`);
	});
	
	return p;
}

let productData: any;

export interface IProduction {
	nameShort: string;
	applicationName: string;
	quality: string;
}

export interface IPackage {
	version: string;
	patchVersion: string;
}

export async function calcCompileFolderName() {
	const product = await getProductData();
	return product.nameShort + (isMac? '.app' : '');
}

export async function getProductData(): Promise<IProduction> {
	try {
		const productFile = resolve(VSCODE_ROOT, 'product.json');
		const jsonData = await readFile(productFile);
		productData = JSON.parse(jsonData);
		return productData;
	} catch (e) {
		throw new Error(`Failed to load product.json: ${e.message}`);
	}
}

let packageData: any;

export async function getPackageData(): Promise<IPackage> {
	try {
		const packageFile = resolve(VSCODE_ROOT, 'package.json');
		const jsonData = await readFile(packageFile);
		packageData = JSON.parse(jsonData);
		return packageData;
	} catch (e) {
		throw new Error(`Failed to load package.json: ${e.message}`);
	}
}