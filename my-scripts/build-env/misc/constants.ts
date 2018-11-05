import { platform } from 'os';
/* No use any node_modules deps */

if (!process.env.RELEASE_ROOT) {
	console.error('Command Failed:\n\tPlease run start.ps1 first.');
	process.exit(1);
}

export const VSCODE_ROOT = requireEnvPath('VSCODE_ROOT');
export const RELEASE_ROOT = requireEnvPath('RELEASE_ROOT');
export const isWin = platform() === 'win32';
export const isMac = platform() === 'darwin';

export function nativePath(p: string) {
	return p.replace(/^\/cygdrive\/([a-z])/i, (m0, drv) => {
		return drv.toUpperCase() + ':';
	});
}

export function requireEnvPath(name: string): string {
	if (!process.env[name]) {
		throw new Error('Env ' + name + ' not set');
	}
	return nativePath(process.env[name]);
}
