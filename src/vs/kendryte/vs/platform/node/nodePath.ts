import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import product from 'vs/platform/node/product';
import { isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';
import { resolvePath } from 'vs/kendryte/vs/platform/node/resolvePath';

/** @deprecated */
export function getInstallPath(environmentService: IEnvironmentService) {
	if (environmentService.isBuilt) {
		return resolvePath(environmentService.execPath, '..');
	} else {
		return resolvePath(environmentService.execPath, '../../..');
	}
}

/** @deprecated */
export function getDataPath(environmentService: IEnvironmentService) {
	return resolvePath(environmentService.userHome, product.dataFolderName);
}

/** @deprecated */
export function exeFile(filePath: string) {
	return isWindows ? filePath + '.exe' : filePath;
}

let sdkPathCache: string;
let toolchainPathCache: string;

/** @deprecated */
export function getToolchainBinPath(environmentService: IEnvironmentService) {
	const rel = getToolchainPath(environmentService);
	return rel ? resolvePath(rel, 'bin') : '';
}

/** @deprecated */
export function getToolchainPath(environmentService: IEnvironmentService) {
	if (!toolchainPathCache) {
		let path = resolvePath(getInstallPath(environmentService), 'packages/toolchain');
		try {
			if (lstatSync(resolvePath(path, 'bin/')).isDirectory()) {
				toolchainPathCache = path;
			}
		} catch (e) { // noop
		}
		if (toolchainPathCache) {
			console.log('%cToolchain is found at %s.', 'color:green', path);
		} else {
			console.log('%cToolchain is expected to be found at %s, But not found.', 'color:red', path);
		}
	}
	return toolchainPathCache || '';
}

/** @deprecated */
export function getSDKPath(environmentService: IEnvironmentService) {
	if (!sdkPathCache) {
		let path = resolvePath(getInstallPath(environmentService), 'packages/SDK');
		try {
			if (lstatSync(resolvePath(path, 'cmake/')).isDirectory()) {
				sdkPathCache = path;
			}
		} catch (e) { // noop
		}
		if (sdkPathCache) {
			console.log('%cSDK is found at %s.', 'color:green', path);
		} else {
			console.log('%cSDK is expected to be found at %s, But not found.', 'color:red', path);
		}
	}
	return sdkPathCache;
}