/* vs/kendryte/vs/workbench/packageManager/common/distribute */
export interface IPackageVersionDetail {
	downloadUrl: string;
	releaseDate?: string;
	versionName: string;
}

export interface IRemotePackageInfo {
	description?: string;
	homepage?: string;
	icon?: string;
	name: string;
	type: 'library';
	versions: IPackageVersionDetail[];
}

export type IRemotePackageRegistry = IRemotePackageInfo[];

/* vs/kendryte/vs/workbench/packageManager/common/type */
export interface ICompileOptions {
	description: string;
	homepage: string;
	icon: string;
	name: string;
	type: 'library';
	version: string;
}
