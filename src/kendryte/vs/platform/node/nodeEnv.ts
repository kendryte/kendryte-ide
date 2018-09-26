import { INodePathService } from 'kendryte/vs/platform/common/type';
import { isWindows } from 'vs/base/common/platform';
import { normalize } from 'path';
import { PathListSep, ShellExportCommand } from 'kendryte/vs/platform/common/platformEnv';
import { writeFile } from 'vs/base/node/pfs';
import { resolvePath } from 'kendryte/vs/platform/node/resolvePath';

export function getEnvKey(upperKey: string) {
	for (const key in process.env) {
		if (process.env.hasOwnProperty(key) && upperKey === key.toUpperCase()) {
			return key;
		}
	}
	return upperKey;
}
export function hideEnv(env: any, watchKey: string) {
	const k = getEnvKey(watchKey);
	if (process.env.hasOwnProperty(k)) {
		env[k] = '';
	}
}

export function getEnvironment(nodePathService: INodePathService) {
	const env: any = {};

	const myPath: string[] = [
		nodePathService.getPackagesPath('cmake/bin'),
		nodePathService.getToolchainBinPath(),
	];

	if (isWindows) {
		const sysRoot = process.env.SystemRoot || 'C:\\Windows';
		const dynamic = [
			sysRoot + '\\system32',
			sysRoot + '',
			sysRoot + '\\System32\\Wbem',
			sysRoot + '\\System32\\WindowsPowerShell\\v1.0',
			sysRoot + '\\System32\\OpenSSH',
		];

		// windows: user may or may not know whats happen, only use very limit set of path
		env.Path = myPath.map(normalize).concat(dynamic).join(PathListSep);
	} else {
		// linux: user know what he do, just passing all
		env.PATH = myPath.join(PathListSep) + PathListSep + process.env.PATH;
	}

	env[getEnvKey('PYTHONHOME')] = nodePathService.getPackagesPath('python2library');

	env[getEnvKey('PYTHONPATH')] = [
		env.PYTHONHOME,
		resolvePath(nodePathService.getToolchainPath(), 'share/gdb/python/gdb'),
	].join(PathListSep);

	env[getEnvKey('PYTHONDONTWRITEBYTECODE')] = 'yes'; // prevent create .pyc files

	return env;
}

export function unsetEnvironment() {
	const ret: any = {};
	for (const item of Object.keys(process.env)) {
		ret[item] = '';
	}
	return ret;
}

/**
 * create a script to show what happens, but not run it
 */
export class DebugScript {
	private readonly prepend: string;
	private cmd: string[] = [];

	constructor(cwd: string, env: any) {
		let dbg = `cd "${cwd}"\n`;
		for (const k of Object.keys(env)) {
			dbg += ShellExportCommand + ' ' + k + '=' + env[k] + '\n';
		}
		this.prepend = dbg;
	}

	command(name: string, args: string[]) {
		args = args.map((item) => {
			if (/\s/.test(item)) {
				return JSON.stringify(item);
			}
			return item;
		});
		this.cmd.push(`"${name}" ${args.join(' ')}`);
	}

	writeBack(workspace: string, file: string) {
		return writeFile(resolvePath(workspace, '.vscode', isWindows ? file + '.bat' : file + '.sh'), this.toString());
	}

	toString() {
		return this.prepend + this.cmd.join('\n');
	}
}
