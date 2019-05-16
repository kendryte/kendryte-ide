import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILoadedCompileInfo } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { Event } from 'vs/base/common/event';

export interface IActionFunction<T, AT extends []> {
	(...args: AT): T
}

export interface IKendryteWorkspaceService {
	_serviceBrand: any;

	readonly onCurrentWorkingDirectoryChange: Event<void | string>;

	readonly workspaceContextService: IWorkspaceContextService;

	requireCurrentWorkspace(): string;
	getCurrentWorkspace(): string | undefined;
	getAllWorkspace(): ReadonlyArray<string>;

	getCurrentFolderName(): string;

	/** Require current workspace exists, not the file */
	requireCurrentWorkspaceFile(...s: string[]): string;
	getCurrentWorkspaceFile(...s: string[]): string | undefined;
	getAllWorkspaceFile(...s: string[]): string[];

	changeWorkspaceByIndex(index: number): void;
	changeWorkspaceByName(name: string): void;
	changeWorkspaceByPath(path: string): void;

	getProjectSetting(dir: string): string;
	isKendryteProject(dir: string): Promise<boolean>;
	readProjectSetting(dir: string): Promise<ILoadedCompileInfo | null>;
	isEmpty(): boolean;
	isEmptyWorkspace(): boolean;
}

export const IKendryteWorkspaceService = createDecorator<IKendryteWorkspaceService>('kendryteWorkspaceService');
