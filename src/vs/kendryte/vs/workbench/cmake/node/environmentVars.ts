import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { isWindows } from 'vs/base/common/platform';
import { environmentPathVarName, getActualEnvironmentKey, PathListSep, PlatformPathArray, ShellExportCommand } from 'vs/kendryte/vs/base/common/platformEnv';
import { writeFile } from 'vs/base/node/pfs';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_EXTRA_PATH } from 'vs/kendryte/vs/base/common/configKeys';
import { MapLike } from 'vs/kendryte/vs/base/common/extendMap';

export function getLimitedEnvironment(nodePathService: INodePathService, configurationService: IConfigurationService): { env: MapLike<string>, path: PlatformPathArray } {
	const env: any = {};

	const pathHandler = new PlatformPathArray(environmentPathVarName, env);
	pathHandler.prepend(...nodePathService.kendrytePaths());

	if (isWindows) {
		const sysRoot = process.env.SystemRoot || 'C:\\Windows';

		pathHandler.append(
			sysRoot + '\\system32',
			sysRoot + '',
			sysRoot + '\\System32\\Wbem',
			sysRoot + '\\System32\\WindowsPowerShell\\v1.0',
			sysRoot + '\\System32\\OpenSSH',
		);
	} else {
		pathHandler.append(
			'/bin',
			'/usr/bin',
			'/usr/local/bin',
		);
		if (process.env.HOME) {
			pathHandler.append(
				process.env.HOME + '/.bin',
				process.env.HOME + '/.local/bin',
			);
		}
	}

	const paths = configurationService.getValue<string[]>(CONFIG_KEY_EXTRA_PATH);
	if (Array.isArray(paths)) {
		pathHandler.append(...paths);
	}

	if (isWindows) {
		env[getActualEnvironmentKey('PYTHONHOME')] = nodePathService.getPackagesPath('python2library');
		env[getActualEnvironmentKey('PYTHONPATH')] = [
			env.PYTHONHOME,
			resolvePath(nodePathService.getToolchainPath(), 'share/gdb/python'),
		].join(PathListSep);
	} else {
		env[getActualEnvironmentKey('PYTHONPATH')] = [
			env.PYTHONHOME || '',
			'/usr/lib/python2.7/',
			'/usr/lib/python2/',
			'/lib/python2.7/',
			'/lib/python2/',
			resolvePath(nodePathService.getToolchainPath(), 'share/gdb/python'),
		].join(PathListSep);
	}

	env[getActualEnvironmentKey('PYTHONDONTWRITEBYTECODE')] = 'yes'; // prevent create .pyc files

	return {
		env,
		path: pathHandler,
	};
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
