import { PACKAGE_MANAGER_DISTRIBUTE_URL } from 'vs/kendryte/vs/services/update/common/protocol';

export interface IPackageVersionDetail {
	versionName: string;
	releaseDate?: string;
	downloadUrl: string;
}

export interface IRemotePackageInfo {
	name: string;
	description?: string;
	README?: string;
	versions: IPackageVersionDetail[];
}

export const PACKAGE_LIST_LIBRARY = `${PACKAGE_MANAGER_DISTRIBUTE_URL}registry/library.json`;
export const PACKAGE_LIST_EXAMPLE = `${PACKAGE_MANAGER_DISTRIBUTE_URL}registry/example.json`;

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
