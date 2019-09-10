import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { ICompileInfo, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { DeepReadonlyArray } from 'vs/kendryte/vs/base/common/type/deepReadonly';
import { localize } from 'vs/nls';

export const ACTION_ID_CREATE_MAKEFILE = 'workbench.action.kendryte.create.makefile';
export const ACTION_LABEL_CREATE_MAKEFILE = localize('createMakefile', 'Create CMakeLists.txt');

export const CONFIG_KEY_INSERT_PRINT_HOOK = 'insert.code.printf.enabled';

export interface DefineValue {
	id: string;
	config: string; // raw / str
	value: string;
	source: string;
}

export interface IProjectInfo<T extends ICompileInfo = ICompileInfo> {
	objectName: string;
	json: T;
	path: string;
	isWorkspaceProject: boolean;
	isRoot: boolean;
	shouldHaveSourceCode: boolean;
	isSimpleFolder: boolean;
	directDependency: IProjectInfo<ILibraryProject>[];
}

export interface IBeforeBuildEvent {
	readonly projects: DeepReadonlyArray<IProjectInfo>;
	waitUntil(thenable: Promise<void>): void;
	registerGlobalConstructor(functionName: string, header: string, critical?: boolean): void;
	registerGlobalExtraSource(sourceFiles: string[]): void;

	registerConstructor(project: IProjectInfo, functionName: string, header: string): void;
	registerExtraSource(project: IProjectInfo, sourceFiles: string[]): void;

	registerGlobalIgnore(ignoreLines: string[]): void;
	registerIgnore(project: IProjectInfo, ignoreLines: string[]): void;
}

export type ICompileInfoWithFile = ICompileInfo & { fsPath: string };

/** this is a friend class with CMake Service, focus on CMakeLists.txt generation */
export interface IMakefileService {
	_serviceBrand: any;

	readonly onPrepareBuild: Event<IBeforeBuildEvent>;

	generateMakefile(path: string): Promise<void>; // only call by cmake service
}

export const IMakefileService = createDecorator<IMakefileService>('makefileService');
