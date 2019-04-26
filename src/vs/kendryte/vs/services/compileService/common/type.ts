import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { ICommonProject, ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export interface IBeforeBuildProject {
	readonly json: Readonly<ICommonProject>;
	readonly projectPath: string;
	registerConstructor(cfg: IProgramConstruct): void;
}

export interface IBeforeBuild {
	readonly mainProject: IBeforeBuildProject;
	readonly projects: ReadonlyArray<IBeforeBuildProject>;
	waitUntil(thenable: Promise<void>): void;
}

export type ICompileInfoWithFile = ICompileInfo & { fsPath: string };

export interface IProgramConstruct {
	header: string;
	source?: string;
	functionName: string;
}

export interface ICompileService {
	_serviceBrand: any;

	readonly onPrepareBuild: Event<IBeforeBuild>;

	prepareToBuild(mainProjectJson: ICompileInfoWithFile, projects: ICompileInfoWithFile[]): Promise<void>; // call by cmake service
}

export const ICompileService = createDecorator<ICompileService>('compileService');
