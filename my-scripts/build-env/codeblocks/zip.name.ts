import { platform } from 'os';
import { normalize } from 'path';
import { isWin } from '../misc/constants';
import { getPackageData, getProductData } from '../misc/fsUtil';

export const TYPE_WINDOWS_SFX = 'exe';
export const TYPE_WINDOWS_ZIP = 'zip';
export const TYPE_LINUX_SFX = '7z.bin';
export const TYPE_LINUX_ZIP = 'zip';
export const TYPE_MAC_SFX = '7z.bin';
export const TYPE_MAC_ZIP = 'zip';

function distFileName(platform: string, type: string): string {
	const product = getProductData();
	const packageJson = getPackageData();
	
	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return normalize(`${platform}.${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`);
}

export function packageFileName(type: string) {
	return `${platform()}.offlinepackages.${type}`;
}

export function calcReleaseFileName() {
	const plat = platform();
	if (isWin) {
		return [distFileName(plat, TYPE_WINDOWS_SFX), distFileName(plat, TYPE_WINDOWS_ZIP)];
	} else {
		return [distFileName(plat, TYPE_LINUX_SFX)];
	}
}

export function nameReleaseFile() {
	const plat = platform();
	return distFileName.bind(undefined, plat);
}