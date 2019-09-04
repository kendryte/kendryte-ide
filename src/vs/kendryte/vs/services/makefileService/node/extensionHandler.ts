import { IBeforeBuildEvent, IProjectInfo } from 'vs/kendryte/vs/services/makefileService/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { GIT_IGNORE_FILE, HOOK_ENTRY_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

interface IProjectTempData {
	constructList: {
		header: string;
		functionName: string;
		critical: boolean;
	}[];
	extraSourceFiles: string[];
	ignoreFiles: string[];
}

export class BeforeBuildEventResult {
	public readonly tempMap = new Map<IProjectInfo, IProjectTempData>();

	constructor(
		projects: ReadonlyArray<IProjectInfo>,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@ILogService private readonly logger: ILogService,
	) {
		for (const project of projects) {
			this.tempMap.set(project, {
				constructList: [],
				extraSourceFiles: [],
				ignoreFiles: [],
			});
		}
	}

	private async commitSingle(project: IProjectInfo, tempData: IProjectTempData) {
		const constructList = tempData.constructList;
		if (!constructList.length) {
			this.logger.info('    %s - No hooks registered.', project.json.name);
			return;
		}

		this.logger.info('    %s - %s hooks registered.', project.json.name, constructList.length);

		const includeHeaders = constructList.map(({ header }) => {
			return `#include "${header}"`;
		}).join('\n');
		const callFunctions = constructList.map(({ functionName }) => {
			return `\t${functionName}();`;
		}).join('\n');

		const sourceFile = `${includeHeaders}
#include <stdio.h>

__attribute__((constructor)) void initialize_kendryte_ide_hook() {
	printf("* Kendryte IDE startup before main().\\n");
${callFunctions}
}
`;

		const target = resolvePath(project.path, PROJECT_CONFIG_FOLDER_NAME, HOOK_ENTRY_FILE_NAME);

		this.logger.info('    write to', target);
		await this.nodeFileSystemService.writeFileIfChanged(target, sourceFile);

		const addedFiles = tempData.extraSourceFiles.concat([HOOK_ENTRY_FILE_NAME]).map((file) => {
			return PROJECT_CONFIG_FOLDER_NAME + '/' + file;
		});

		const json: ILibraryProject = project.json as unknown as ILibraryProject;
		if (!json.source) {
			json.source = [];
		}
		json.source.push(...addedFiles);

		const ignoreFile = resolvePath(project.path, PROJECT_CONFIG_FOLDER_NAME, GIT_IGNORE_FILE);
		const ignoreData = tempData.ignoreFiles.join('\n');
		if (ignoreData.length) {
			await this.nodeFileSystemService.writeFileIfChanged(ignoreFile, ignoreData);
		} else {
			await this.nodeFileSystemService.deleteFileIfExists(ignoreFile);
		}
	}

	public async commit() {
		for (const [proj, data] of this.tempMap.entries()) {
			await this.commitSingle(proj, data);
		}
	}
}

export class BeforeBuildEvent implements IBeforeBuildEvent {
	private readonly tempMap = this.result.tempMap;

	constructor(
		public readonly projects: IProjectInfo[],
		private readonly result: BeforeBuildEventResult,
		private readonly thenables: Promise<any>[],
	) {

	}

	registerGlobalConstructor(functionName: string, header: string, critical = false): void {
		return this.registerConstructor(this.projects[0], functionName, header, critical);
	}

	registerGlobalExtraSource(sourceFiles: string[]): void {
		return this.registerExtraSource(this.projects[0], sourceFiles);
	}

	registerGlobalIgnore(ignoreLines: string[]) {
		this.registerIgnore(this.projects[0], ignoreLines);
	}

	registerConstructor(project: IProjectInfo, functionName: string, header: string, critical = false) {
		if (critical) {
			this.tempMap.get(project)!.constructList.unshift({
				functionName,
				header,
				critical,
			});
		} else {
			this.tempMap.get(project)!.constructList.push({
				functionName,
				header,
				critical,
			});
		}
	}

	registerExtraSource(project: IProjectInfo, sourceFiles: string[]) {
		this.tempMap.get(project)!.extraSourceFiles.push(...sourceFiles);
	}

	registerIgnore(project: IProjectInfo, ignoreLines: string[]) {
		this.tempMap.get(project)!.ignoreFiles.push(...ignoreLines);
	}

	waitUntil(thenable: Promise<void>) {
		if (Object.isFrozen(this.thenables)) {
			throw new TypeError('waitUntil cannot be called async');
		}
		this.thenables.push(thenable);
	}
}
