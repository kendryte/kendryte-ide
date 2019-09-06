import { CONFIG_KEY_INSERT_PRINT_HOOK, IBeforeBuildEvent, IProjectInfo } from 'vs/kendryte/vs/services/makefileService/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { GIT_IGNORE_FILE, HOOK_ENTRY_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY } from 'vs/kendryte/vs/base/common/configKeys';
import { localize } from 'vs/nls';

interface IProjectTempData {
	constructList: {
		header: string;
		functionName: string;
		functionArguments: string[];
		critical: boolean;
	}[];
	extraSourceFiles: string[];
	ignoreFiles: string[];
}

registerConfiguration({
	id: 'insert.printf',
	category: CONFIG_CATEGORY.KENDRYTE.id,
	overridable: true,
	properties: {
		[CONFIG_KEY_INSERT_PRINT_HOOK]: {
			title: localize('insertPrintfEnabled', 'Debug IDE Hook'),
			type: 'boolean',
			default: false,
			description: localize('insertPrintf', 'Insert a printf before main() when compiling.'),
		},
	},
});

export class BeforeBuildEventResult {
	public readonly tempMap = new Map<IProjectInfo, IProjectTempData>();

	constructor(
		projects: ReadonlyArray<IProjectInfo>,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@ILogService private readonly logger: ILogService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
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
		const ignoreFile = resolvePath(project.path, PROJECT_CONFIG_FOLDER_NAME, GIT_IGNORE_FILE);
		const target = resolvePath(project.path, PROJECT_CONFIG_FOLDER_NAME, HOOK_ENTRY_FILE_NAME);

		if (!constructList.length) {
			this.logger.info('    %s - No hooks registered.', project.json.name);
			await this.nodeFileSystemService.deleteFileIfExists(ignoreFile);
			await this.nodeFileSystemService.deleteFileIfExists(target);
			return;
		}

		this.logger.info('    %s - %s hooks registered.', project.json.name, constructList.length);

		const logContent = '* Kendryte IDE startup before main().';
		const showLog = this.configurationService.getValue<boolean>(CONFIG_KEY_INSERT_PRINT_HOOK);
		if (showLog) {
			this.logger.warn('You will see "%s" from serial port before program start. you can change this in settings (search: %s).', logContent, CONFIG_KEY_INSERT_PRINT_HOOK);
			constructList.unshift({
				header: 'stdio.h',
				functionName: 'printf',
				functionArguments: ['"\\n\\ec\\r"' + JSON.stringify(logContent) + '"\\n"'],
				critical: true,
			});
		}

		const includeHeaders = constructList.map(({ header }) => {
			return `#include "${header}"`;
		}).join('\n');
		const callFunctions = constructList.map(({ functionName, functionArguments }) => {
			return `\t${functionName}(${functionArguments.join(', ')});`;
		}).join('\n');

		const sourceFile = `${includeHeaders}
static int has_already_init = 0; // back comp sdk
__attribute__((constructor)) void initialize_kendryte_ide_hook() {
	if (has_already_init) return;
	has_already_init = 1;
${callFunctions}
}
`;

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
				functionArguments: [],
			});
		} else {
			this.tempMap.get(project)!.constructList.push({
				functionName,
				header,
				critical,
				functionArguments: [],
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
