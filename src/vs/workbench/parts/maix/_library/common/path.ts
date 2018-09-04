import { INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { isWindows } from 'vs/base/common/platform';

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
	'PROCESSOR_IDENTIFIER',
	'PWD',
	'TERM',
	'USER',
];

export function getEnvironment(nodePathService: INodePathService) {
	const env: any = {};
	const path: string[] = [
		nodePathService.getPackagesPath('cmake/bin'),
		nodePathService.getToolchainBinPath(),
	];
	if (isWindows) {
		for (const key of WINDOWS_PASSING_ENV) {
			env[key] = process.env[key];
		}
		env.PATH = path.join(';');
	} else {
		path.push('/usr/bin'); // for `make`

		env.PATH = path.join(':');
	}

	return env;
}

export function unsetEnvironment() {
	const ret: any = {};
	for (const item of Object.keys(process.env)) {
		ret[item] = '';
	}
	return ret;
}
