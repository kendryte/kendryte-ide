import { platform } from 'os';

export const isWin = platform() === 'win32';

if (!process.env.RELEASE_ROOT) {
	console.error('Command Failed:\n\tPlease run start.%s first.', isWin? 'ps1' : 'sh');
	process.exit(1);
}

export const UILanguage = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || '';
process.env.LANG = 'C';
process.env.LC_ALL = 'C';

export const VSCODE_ROOT = requireEnvPath('VSCODE_ROOT');
export const RELEASE_ROOT = requireEnvPath('RELEASE_ROOT');
export const ARCH_RELEASE_ROOT = requireEnvPath('ARCH_RELEASE_ROOT');

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
