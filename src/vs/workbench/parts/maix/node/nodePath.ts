import { dirname, join, resolve } from 'path';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import product from 'vs/platform/node/product';

export function getInstallPath(environmentService: IEnvironmentService) {
	return resolve(environmentService.execPath, '..');
}

export function getDataPath(environmentService: IEnvironmentService) {
	return resolve(environmentService.userHome, product.dataFolderName);
}

// return some path like node_modules
export function expandToRoot(currentDir: string, fileName: string): string[] {
	const ret: string[] = [];
	currentDir = resolve(currentDir);
	while (currentDir !== '/') {
		ret.push(currentDir + '/' + fileName);

		currentDir = dirname(currentDir);
	}
	ret.push('/' + fileName);
	return ret;
}

export function CMakeToolsConfigPath() {
	let userLocalDir = '';
	if (process.platform === 'win32') {
		userLocalDir = process.env['AppData']!;
	} else {
		userLocalDir = process.env['XDG_DATA_HOME'];
		if (!userLocalDir) {
			const home = process.env['HOME'] || process.env['PROFILE']!;
			userLocalDir = join(home, '.local/share');
		}
	}
	return join(userLocalDir, 'CMakeTools', 'cmake-kits.json');
}