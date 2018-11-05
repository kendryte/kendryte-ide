///<reference types="node"/>

import { execSync } from 'child_process';
import { existsSync, lstatSync, mkdirSync } from 'fs';
import { platform } from 'os';
import { resolve } from 'path';

export const isWin = platform() === 'win32';

export function nativePath(p) {
	return p.replace(/^\/cygdrive\/([a-z])/i, (m0, drv) => {
		return drv.toUpperCase() + ':';
	});
}

export function mkdirpSync(p) {
	if (!p) {
		throw new Error('path must not empty string');
	}
	if (!existsSync(p)) {
		mkdirpSync(resolve(p, '..'));
		mkdirSync(p);
	}
}

export function cdNewDir(p) {
	mkdirpSync(p);
	process.chdir(p);
	console.log('\n > %s', process.cwd());
}

export function yarnPackageDir(what) {
	return resolve(requireEnvPath('RELEASE_ROOT'), 'yarn-dir', what);
}

export function requireEnvPath(name: string): string {
	if (!process.env[name]) {
		throw new Error('Env ' + name + ' not set');
	}
	return nativePath(process.env[name]);
}

export function winSize() {
	if (process.stderr.columns) {
		return process.stderr.columns;
	}
	try {
		if (platform() === 'win32' && !process.env.SHELL) {
			const cmd = 'powershell (Get-Host).UI.RawUI.WindowSize.width';
			const code = execSync(cmd).toString().trim();
			return parseInt(code);
		} else {
			const cmd = 'tput cols';
			const code = execSync(cmd).toString().trim();
			return parseInt(code);
		}
	} catch (e) {
	}
	return NaN;
}

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
		console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.message);
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

export function thisIsABuildScript() {
	if (!process.env.RELEASE_ROOT) {
		console.error('Command Failed:\n\tPlease run start.ps1 first.');
		process.exit(1);
	}
}

export function isLink(path: string) {
	try {
		return lstatSync(path).isSymbolicLink();
	} catch (e) {
	}
}

export function isExists(path: string): boolean {
	try {
		lstatSync(path);
		return true;
	} catch (e) {
		return false;
	}
}