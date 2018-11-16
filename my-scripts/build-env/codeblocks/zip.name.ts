import { platform } from 'os';
import { normalize } from 'path';
import { isMac, isWin } from '../misc/constants';
import { getPackageData, getProductData } from '../misc/fsUtil';

export const TYPE_WINDOWS_SFX = 'exe';
export const TYPE_WINDOWS_ZIP = 'zip';
export const TYPE_LINUX_SFX = '7z.bin';
export const TYPE_LINUX_ZIP = 'zip';
export const TYPE_MAC_SFX = '7z.bin';
export const TYPE_MAC_ZIP = 'zip';

const types: string[] = [];
if (isWin) {
	types.push(TYPE_WINDOWS_SFX, TYPE_WINDOWS_ZIP);
} else if (isMac) {
	types.push(TYPE_MAC_SFX, TYPE_MAC_ZIP);
} else {
	types.push(TYPE_LINUX_SFX, TYPE_LINUX_ZIP);
}
export const CURRENT_PLATFORM_TYPES = types; // first element is important !!!

export function releaseFileName(platform: string, type: string): string {
	const product = getProductData();
	const packageJson = getPackageData();
	
	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return normalize(`${platform}.${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`);
}

export function packageFileName(platform: string, type: string) {
	return `${platform}.offlinepackages.${type}`;
}

export function nameReleaseFile() {
	const plat = platform();
	return releaseFileName.bind(undefined, plat);
}