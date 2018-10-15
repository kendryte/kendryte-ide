/* this url should contain file "projects.json" */
export const REQUIRED_BLOCK_DISTRIBUTE_URL = 'https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/3rd-party';
/* this url should contain file "IDE.json" */
export const IDE_MAIN_DISTRIBUTE_URL = 'https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/release';
/* this url should contain file "registry/library.json" and "registry/example.json" */
export const PACKAGE_MANAGER_DISTRIBUTE_URL = 'https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/package-manager';

export const IDE_HOMEPAGE = 'https://github.com/kendryte/kendryte-ide';

export interface IPackageVersionPlatform {
	ignore?: boolean; // true -> ignore this platform [Only for building blocks]

	32: string;
	64: string;
	generic: string;
}

export interface IPlatformAwareUpdateInfo {
	windows: IPackageVersionPlatform;
	linux: IPackageVersionPlatform;
	mac: IPackageVersionPlatform;
}

export interface IBaseUpdateInfo extends IPlatformAwareUpdateInfo { // outer json file
	version: string;
}

export interface IBuildingBlocksUpdateInfo extends IBaseUpdateInfo {
	// projects.json contains Array of this
	projectName: string;
}

export interface IPatchUpdateInfo extends IBaseUpdateInfo {
}

export interface IBasePackageInfo<T> {
	projectName: string;
	homepage?: string;
	readme?: string; // url to a mark down file
	versions: T[];
}

export interface IExamplePackageVersion {
	version: string;
	source: string; // download url of example
}

export interface IExamplePackageInfo extends IBasePackageInfo<IExamplePackageVersion> {
}

export interface ILibraryPackageInfo extends IBasePackageInfo<IBaseUpdateInfo> {
}

export interface IIDEUpdateInfo {
	// IDE.json contains this
	version: string;

	homepage: string;

	// platforms:
	windows: string;
	linux: string;
	mac: string;

	patches: IPatchUpdateInfo[];
}
