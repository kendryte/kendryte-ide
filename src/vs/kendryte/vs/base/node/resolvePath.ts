import { normalize, resolve } from 'path';
import { isWindows } from 'vs/base/common/platform';
import product from 'vs/platform/node/product';
import { tmpdir } from "os";

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
		return resolvePath(tmpdir(), product.dataFolderName, name);
	} else {
		return resolvePath(tmpdir(), product.dataFolderName);
	}
}