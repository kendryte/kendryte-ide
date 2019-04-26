import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IBeforeBuild, IBeforeBuildProject, ICompileInfoWithFile, ICompileService, IProgramConstruct } from 'vs/kendryte/vs/services/compileService/common/type';
import { AsyncEmitter } from 'vs/base/common/event';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { HOOK_ENTRY_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { ILogService } from 'vs/platform/log/common/log';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { CMakeProjectTypes, ICommonProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

class BeforeBuildProject implements IBeforeBuildProject {
	public readonly constructList: IProgramConstruct[] = [];
	public readonly json: ICommonProject;
	public readonly projectPath: string;

	constructor(
		pkg: ICompileInfoWithFile,
	) {
		this.projectPath = pkg.fsPath;
		this.json = pkg;
	}

	registerConstructor(cfg: IProgramConstruct) {
		this.constructList.push(cfg);
	}
}

class CompileService implements ICompileService {
	public _serviceBrand: any;

	private readonly _onPrepareBuild = new AsyncEmitter<IBeforeBuild>();
	public readonly onPrepareBuild = this._onPrepareBuild.event;
	private readonly logger: ILogService;

	constructor(
		@IChannelLogService channelLogService: IChannelLogService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	public async prepareToBuild(mainProjectJson: ICompileInfoWithFile, projectJsonList: ICompileInfoWithFile[]) {
		const mainProject = new BeforeBuildProject(mainProjectJson);
		const projects: BeforeBuildProject[] = [];
		for (const pkg of projectJsonList) {
			if (pkg.type === CMakeProjectTypes.library && pkg.prebuilt) {
				continue;
			}
			if (pkg === mainProjectJson) {
				projects.push(mainProject);
			} else {
				projects.push(new BeforeBuildProject(pkg));
			}
		}

		await this._onPrepareBuild.fireAsync((thenables) => {
			return {
				mainProject,
				projects,
				waitUntil: (thenable: Promise<void>) => {
					if (Object.isFrozen(thenables)) {
						throw new TypeError('waitUntil cannot be called async');
					}
					thenables.push(thenable);
				},
			};
		});

		this.logger.info('Generating IDE tools hook file...');
		for (const project of projects) {
			await this.commitHooks(project);
		}
	}

	private async commitHooks(result: BeforeBuildProject) {
		const constructList = result.constructList;
		if (!constructList.length) {
			this.logger.info('    %s - No hooks registered.', result.json.name);
			return;
		}

		this.logger.info('    %s - %s hooks registered.', result.json.name, constructList.length);

		const includeHeaders = constructList.map(({ header }) => {
			return `#include "${header}"`;
		}).join('\n');
		const callFunctions = constructList.map(({ functionName }) => {
			return `${functionName}();`;
		}).join('\n');
		const sourceToCompile = constructList.map(({ source }) => {
			return `${source}`;
		}).filter((e) => {
			return !!e;
		});

		const sourceFile = `${includeHeaders}

__attribute__((constructor)) void initialize_kendryte_ide_hook() {
${callFunctions}
}
`;

		const target = resolvePath(result.projectPath, PROJECT_CONFIG_FOLDER_NAME, HOOK_ENTRY_FILE_NAME);

		this.logger.info('    write to', target);
		await this.nodeFileSystemService.writeFileIfChanged(target, sourceFile);

		const addedFiles = sourceToCompile.concat([HOOK_ENTRY_FILE_NAME]).map((file) => {
			return PROJECT_CONFIG_FOLDER_NAME + '/' + file;
		});

		result.json.source.push(...addedFiles);
	}
}

registerSingleton(ICompileService, CompileService);
