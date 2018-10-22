import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

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
	console.error('    chdir(%s)', p);
	process.chdir(p);
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