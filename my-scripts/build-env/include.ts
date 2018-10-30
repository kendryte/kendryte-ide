import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { platform } from 'os';
import { execSync } from 'child_process';

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

export function winSize() {
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

export function runMain(main: () => Promise<void>) {
	main().catch((e) => {
		console.error('Command ' + e.message);
		process.exit(1);
	});
}