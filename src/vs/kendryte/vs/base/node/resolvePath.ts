import { normalize, relative, resolve } from 'path';
import { isWindows } from 'vs/base/common/platform';
import { tmpdir } from 'os';

const winSlash = /\\/g;
export const TEMP_DIR_NAME = 'KendryteIDE.Cache';

export interface ResolvePathFunction {
	(...pathSegments: string[]): string;
}

export interface JoinPathFunction {
	(from: string, to: string): string;
}

export const resolvePath: ResolvePathFunction = isWindows ? resolveWindowsPath : resolve;

function resolveWindowsPath(...pathSegments: string[]): string {
	return resolve(...pathSegments).replace(winSlash, '/');
}

export interface NormalizePathFunction {
	(path: string): string;
}

export const normalizePosixPath: NormalizePathFunction = isWindows ? normalizeWindowsPath : normalize;

function normalizeWindowsPath(path: string): string {
	return normalize(path).replace(winSlash, '/');
}

export function osTempDir(name?: string) {
	if (name) {
		return resolvePath(tmpdir(), TEMP_DIR_NAME, name);
	} else {
		return resolvePath(tmpdir(), TEMP_DIR_NAME);
	}
}

function relativeWindowsPath(from: string, to: string) {
	return relative(normalize(from), normalize(to)).replace(winSlash, '/');
}

export const relativePath: JoinPathFunction = isWindows ? relativeWindowsPath : relative;
