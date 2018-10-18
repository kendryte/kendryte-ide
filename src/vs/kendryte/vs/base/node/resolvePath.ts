import { normalize, resolve } from 'path';
import { isWindows } from 'vs/base/common/platform';
import { tmpdir } from 'os';

export const TEMP_DIR_NAME = 'KendryteIDE.Cache';

export interface ResolvePathFunction {
	(...pathSegments: string[]): string;
}

export const resolvePath: ResolvePathFunction = isWindows ? resolveWindowsPath : resolve;

function resolveWindowsPath(...pathSegments: string[]): string {
	return resolve(...pathSegments).replace(/\\/g, '/');
}

export interface NormalizePathFunction {
	(path: string): string;
}

export const normalizePosixPath: NormalizePathFunction = isWindows ? normalizeWindowsPath : normalize;

function normalizeWindowsPath(path: string): string {
	return normalize(path).replace(/\\/g, '/');
}

export function osTempDir(name?: string) {
	if (name) {
		return resolvePath(tmpdir(), TEMP_DIR_NAME, name);
	} else {
		return resolvePath(tmpdir(), TEMP_DIR_NAME);
	}
}