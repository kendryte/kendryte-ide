import { resolve } from 'path';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import product from 'vs/platform/node/product';
import { isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';

export function getInstallPath(environmentService: IEnvironmentService) {
	if (environmentService.isBuilt) {
		return resolve(environmentService.execPath, '..');
	} else {
		return resolve(environmentService.execPath, '../../..');
	}
}

export function getDataPath(environmentService: IEnvironmentService) {
	return resolve(environmentService.userHome, product.dataFolderName);
}

export function exeFile(filePath: string) {
	return isWindows? filePath + '.exe' : filePath;
}

let pathCache: string;
let warn: boolean = false;

export function getSDKPath(environmentService: IEnvironmentService) {
	if (!pathCache) {
		let path = resolve(getInstallPath(environmentService), 'packages/SDK');
		try {
			if (lstatSync(path).isDirectory()) {
				pathCache = path;
			}
		} catch (e) { // noop
		}
		if (!warn) {
			warn = true;
			if (pathCache) {
				console.log('%cSDK is found at %s.', 'color:green', path);
			} else {
				console.log('%cSDK is expected to be found at %s, But not found.', 'color:red', path);
			}
		}
	}
	return pathCache;
}
