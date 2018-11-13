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
	readlink as readlinkAsync
} from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { isMac, VSCODE_ROOT } from './constants';

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
export const readlink = promisify(readlinkAsync);

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

export async function getProductData(alterRoot: string = VSCODE_ROOT): Promise<IProduction> {
	try {
		const productFile = resolve(alterRoot, 'product.json');
		const jsonData = await readFile(productFile);
		productData = JSON.parse(jsonData);
		return productData;
	} catch (e) {
		throw new Error(`Failed to load product.json: ${e.message}`);
	}
}

let packageData: any;

export async function getPackageData(alterRoot: string = VSCODE_ROOT): Promise<IPackage> {
	try {
		const packageFile = resolve(alterRoot, 'package.json');
		const jsonData = await readFile(packageFile);
		packageData = JSON.parse(jsonData);
		return packageData;
	} catch (e) {
		throw new Error(`Failed to load package.json: ${e.message}`);
	}
}