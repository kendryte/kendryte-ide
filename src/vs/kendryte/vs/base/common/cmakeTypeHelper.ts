import { CMakeProjectTypes, ICompileInfoPossibleKeys, ICompileInfoReadonly, IExecutableProject, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { MapLike } from 'vs/kendryte/vs/base/common/extendMap';

export function packageJsonArray<T extends string>(pkg: ICompileInfoReadonly, key: T): ReadonlyArray<T> | undefined {
	return (pkg as any)[key];
}

export function packageJsonObject<T = string>(pkg: ICompileInfoReadonly, key: ICompileInfoPossibleKeys): Readonly<MapLike<T>> | undefined {
	return (pkg as any)[key];
}

export function packageJsonString(pkg: ICompileInfoReadonly, key: ICompileInfoPossibleKeys): Readonly<string> | undefined {
	return (pkg as any)[key];
}

export function packageJsonIsNormal(pkg: ICompileInfoReadonly): pkg is ILibraryProject | IExecutableProject {
	if (pkg.type === CMakeProjectTypes.library || pkg.type === CMakeProjectTypes.executable) {
		return true;
	}
	return false;
}
