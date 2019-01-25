import { PACKAGE_MANAGER_DISTRIBUTE_URL } from 'vs/kendryte/vs/base/common/constants/remoteRegistry';
import { CMakeProjectTypes } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export interface IPackageVersionDetail {
	versionName: string;
	releaseDate?: string;
	downloadUrl: string;
}

export interface IRemotePackageInfo {
	name: string;
	icon?: string;
	description?: string;
	homepage?: string;
	versions: IPackageVersionDetail[];
	type: CMakeProjectTypes;
}

const urlPrefix = /\/$/.test(PACKAGE_MANAGER_DISTRIBUTE_URL) ? PACKAGE_MANAGER_DISTRIBUTE_URL : PACKAGE_MANAGER_DISTRIBUTE_URL + '/';
export const PACKAGE_LIST_LIBRARY = `${urlPrefix}registry/library.json`;
export const PACKAGE_LIST_EXAMPLE = `${urlPrefix}registry/example.json`;

/**
 * query return IRemotePackageInfo[]
 *  -- versions max 3 items
 **/
// export function buildUrlPackageList(type: PackageTypes, search: string = '', page: number = 1) {
// 	return `${distributeUrl}package-manager/${PackageTypes[type]}.json?keyword=${encodeURIComponent(search)}&page=${page}`;
// }

/**
 * query return IRemotePackageInfo
 **/
// export function buildUrlPackageInfo(type: PackageTypes, packageName: string) {
// 	return `${distributeUrl}package-manager/${PackageTypes[type]}/${packageName}.json`;
// }
