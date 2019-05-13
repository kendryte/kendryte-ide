import { isWindows } from 'vs/base/common/platform';
import { normalize } from 'vs/base/common/path';
import { uniqueFilter } from 'vs/base/common/arrays';

export const PathListSep = isWindows ? ';' : ':';
export const ShellExportCommand = isWindows ? 'SET' : 'export';

export const executableExtension = isWindows ? '.exe' : '';
export const is64Bit = process.arch === 'x64';

export class PlatformPathArray {
	private current: string[];
	private readonly envName: string;

	constructor(envName: string) {
		envName = envName.toUpperCase();
		this.envName = Object.keys(process.env).find((item) => {
			return item.toUpperCase() === envName;
		}) || envName;
	}

	add(...paths: string[]) {
		this.reload();
		this.current.unshift(...paths);
		this.current = paths
			.concat(this.current)
			.map((item) => item.replace(/[\\\/]+$/, ''))
			.map(path => normalize(path))
			.filter(uniqueFilter(i => i));
		this.save();
	}

	save() {
		process.env[this.envName] = this.current.join(PathListSep);
	}

	private reload() {
		this.current = (process.env[this.envName] || '').split(PathListSep);
	}
}

export const processEnvironmentPathList = new PlatformPathArray('path');
