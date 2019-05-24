import { isWindows } from 'vs/base/common/platform';
import { normalize } from 'vs/base/common/path';
import { uniqueFilter } from 'vs/base/common/arrays';
import { MapLike } from 'vs/kendryte/vs/base/common/extendMap';

export const PathListSep = isWindows ? ';' : ':';
export const ShellExportCommand = isWindows ? 'SET' : 'export';

export const executableExtension = isWindows ? '.exe' : '';
export const is64Bit = process.arch === 'x64';

export const environmentPathVarName = isWindows ? 'Path' : 'PATH';

export function getActualEnvironmentKey(upperKey: string, env: MapLike<string | undefined> = process.env) {
	upperKey = upperKey.toUpperCase();
	for (const key of Object.keys(env)) {
		if (upperKey === key.toUpperCase()) {
			return key;
		}
	}
	return upperKey;
}

export function findEnvironment(field: string, env: MapLike<string | undefined> = process.env): undefined | { key: string; value: string; } {
	field = field.toUpperCase();
	for (const key of Object.keys(env)) {
		if (field === key.toUpperCase()) {
			return { key, value: env[key]! };
		}
	}
	return undefined;
}

export function removeEnvironment(field: string, env: MapLike<string | undefined> = process.env): MapLike<string> {
	field = field.toUpperCase();
	for (const key of Object.keys(env)) {
		if (key.toUpperCase() === field) {
			delete env[key];
		}
	}
	return env as any;
}

export class PlatformPathArray {
	private current: string[];

	constructor(
		private readonly envName: string,
		private readonly env = process.env,
	) {
		const original = findEnvironment(envName, env);
		if (original) {
			removeEnvironment(original.key, env);
			env[envName] = original.value;
		}
		this.reload();
	}

	prepend(...paths: string[]) {
		this.reload();
		this.current.unshift(...paths);
		this.save();
	}

	append(...paths: string[]) {
		this.reload();
		this.current.push(...paths);
		this.save();
	}

	save() {
		this.current = this.current
			.map((item) => item.replace(/[\\\/]+$/, ''))
			.map(path => normalize(path))
			.filter(uniqueFilter(i => i));
		this.env[this.envName] = this.current.join(PathListSep);
	}

	private reload() {
		this.current = (this.env[this.envName] || '').split(PathListSep).filter(e => e.length > 0);
	}

	toString() {
		this.reload();
		return this.current.join(PathListSep);
	}

	[Symbol.iterator](): IterableIterator<string> {
		this.reload();
		return this.current[Symbol.iterator]();
	}
}

export const processEnvironmentPathList = new PlatformPathArray(environmentPathVarName);
