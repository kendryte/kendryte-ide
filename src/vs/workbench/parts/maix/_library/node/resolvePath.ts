import { resolve } from 'path';
import { isWindows } from 'vs/base/common/platform';

export interface ResolvePathFunction {
	(...pathSegments: string[]): string;
}

export const resolvePath: ResolvePathFunction = isWindows ? normalizeWindowsPath : resolve;

function normalizeWindowsPath(...pathSegments: string[]): string {
	return resolve(...pathSegments).replace(/\\/g, '/');
}
