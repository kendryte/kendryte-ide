/* vs/kendryte/vs/workbench/packageManager/common/distribute */
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
	type: 'library';
}

export type IRemotePackageRegistry = IRemotePackageInfo[];

/* vs/kendryte/vs/workbench/packageManager/common/type */
export interface ICompileOptions {
	type: 'library';
	name: string;
	version: string;
	
	homepage: string;
	description: string;
	icon: string;
}
