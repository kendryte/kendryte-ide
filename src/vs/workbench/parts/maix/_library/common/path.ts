import { INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { isWindows } from 'vs/base/common/platform';
import { normalize } from 'path';
import { PathListSep, ShellExportCommand } from 'vs/workbench/parts/maix/_library/common/platformEnv';
import { writeFile } from 'vs/base/node/pfs';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';

export const WINDOWS_PASSING_ENV = [
	'ALLUSERSPROFILE',
	'LOCALAPPDATA',
	'ALL_PROXY',
	'NODE_ENV',
	'APPDATA',
	'ARCH',
	'OS',
	'COMMONPROGRAMFILES',
	'COMPUTERNAME',
	'NUMBER_OF_PROCESSORS',
	'HOME',
	'HOSTNAME',
	'HTTPS_PROXY',
	'HTTP_PROXY',
	'LANG',
	'PATHEXT',
	'PROCESSOR_ARCHITECTURE',
	'PROCESSOR_IDENTIFIER',
	'PROCESSOR_LEVEL',
	'PROCESSOR_REVISION',
	'TERM',
	'TEMP',
	'TMP',
	'USERNAME',
	'PSMODULEPATH',
	'DRIVERDATA',
	'COMSPEC',
	'WINDIR',
	'SYSTEMDRIVE',
	'SYSTEMROOT',
];

export function getEnvironment(nodePathService: INodePathService) {
	let env: any;
	const path: string[] = [
		nodePathService.getPackagesPath('cmake/bin'),
		nodePathService.getToolchainBinPath(),
	];

	if (isWindows) {
		// windows: user may or may not know whats happen
		env = unsetEnvironment();

		for (const key of Object.keys(process.env)) {
			const ukey = key.toUpperCase();
			if (WINDOWS_PASSING_ENV.indexOf(ukey) !== -1) {
				env[key] = process.env[key];
			}
		}

		const dynamic = [
			'%SystemRoot%\\system32',
			'%SystemRoot%',
			'%SystemRoot%\\System32\\Wbem',
			'%SYSTEMROOT%\\System32\\WindowsPowerShell\\v1.0',
			'%SYSTEMROOT%\\System32\\OpenSSH',
		];

		env.PWD = normalize(nodePathService.workspaceFilePath('build'));
		env.PATH = path.map(normalize).concat(dynamic).join(PathListSep);
	} else {
		// linux: user know what he do, just passing all
		env = Object.assign({}, process.env);

		env.PWD = nodePathService.workspaceFilePath('build');
		env.PATH = path.join(PathListSep) + PathListSep + process.env.PATH;
	}

	env.PYTHONHOME = nodePathService.getPackagesPath('python2library');

	env.PYTHONPATH = [
		env.PYTHONHOME,
		resolvePath(nodePathService.getToolchainPath(), 'share/gdb/python/gdb'),
	].join(PathListSep);

	env.PYTHONDONTWRITEBYTECODE = 'yes';

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
