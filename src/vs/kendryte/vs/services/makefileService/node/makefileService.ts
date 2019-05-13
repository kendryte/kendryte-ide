import { IBeforeBuildEvent, IMakefileService, IProjectInfo } from 'vs/kendryte/vs/services/makefileService/common/type';
import { AsyncEmitter } from 'vs/base/common/event';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { ILogService, LogLevel } from 'vs/platform/log/common/log';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { BeforeBuildEvent, BeforeBuildEventResult } from 'vs/kendryte/vs/services/makefileService/node/extensionHandler';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MakefileServiceResolve } from 'vs/kendryte/vs/services/makefileService/node/resolve';
import { MakefileServiceWritter } from 'vs/kendryte/vs/services/makefileService/node/write';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_BUILD_VERBOSE } from 'vs/kendryte/vs/base/common/configKeys';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { URI } from 'vs/base/common/uri';
import { createSimpleErrorMarker } from 'vs/kendryte/vs/platform/marker/common/simple';
import { PathAttachedError } from 'vs/kendryte/vs/platform/marker/common/errorWithPath';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';

const MARKER_ID = 'makefile';

export class MakefileService implements IMakefileService {
	public _serviceBrand: any;

	private readonly _onPrepareBuild = new AsyncEmitter<IBeforeBuildEvent>();
	public readonly onPrepareBuild = this._onPrepareBuild.event;

	private readonly _projectNameMap = new Map<string/* projectName */, string/* project absolute path */>();

	private readonly logger: ILogService;
	private isDebugMode: boolean;

	constructor(
		@IChannelLogService channelLogService: IChannelLogService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		this.updateLevel();
		configurationService.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration(CONFIG_KEY_BUILD_VERBOSE)) {
				this.updateLevel();
			}
		});
	}

	private updateLevel() {
		this.isDebugMode = this.configurationService.getValue<boolean>(CONFIG_KEY_BUILD_VERBOSE);
		if (this.isDebugMode) {
			this.logger.setLevel(LogLevel.Debug);
		} else {
			this.logger.setLevel(LogLevel.Info);
		}
	}

	async generateMakefile(projectPath: string) {
		return this._generateMakefile(projectPath).then(() => {
			this.markerService.changeAll(MARKER_ID, []);
		}, (e) => {
			if (e instanceof PathAttachedError) {
				this.markerService.changeOne(MARKER_ID, e.resource, [createSimpleErrorMarker(e)]);
			} else {
				this.markerService.changeOne(MARKER_ID, URI.file(projectPath + '/' + CMAKE_CONFIG_FILE_NAME), [createSimpleErrorMarker(e)]);
			}
			throw e;
		});
	}

	private async _generateMakefile(projectPath: string) {
		this.logger.info('Generate CMakeLists.txt file:');

		await this.refreshProjectMap();

		const treeResolver = this.instantiationService.createInstance(MakefileServiceResolve, projectPath, this._projectNameMap, this.logger);
		const projectList = await treeResolver.readProjectJsonList();

		// TODO: cross project compile

		await this.firePrepareBuildEvent(projectList);

		const resolvedProjectList = await treeResolver.resolveDependencies();

		const allProjects = resolvedProjectList.map((item) => {
			return item.json.name;
		});
		for (const project of resolvedProjectList) {
			const listOutput = this.instantiationService.createInstance(
				MakefileServiceWritter,
				project,
				this.isDebugMode,
				allProjects,
				this.logger,
			);
			await listOutput.write();
		}
	}

	public async firePrepareBuildEvent(projectList: ReadonlyArray<IProjectInfo>) {
		const sourceProjects = projectList.filter(({ shouldHaveSourceCode }) => {
			return shouldHaveSourceCode;
		});

		const result = new BeforeBuildEventResult(sourceProjects, this.nodeFileSystemService, this.logger);
		await this._onPrepareBuild.fireAsync((thenables) => {
			return new BeforeBuildEvent(sourceProjects, result, thenables);
		});
		this.logger.info('Generating IDE tools hook file...');

		await result.commit();
	}

	private async refreshProjectMap() {
		this._projectNameMap.clear();
		for (const workspaceFolder of this.kendryteWorkspaceService.getAllWorkspace()) {
			const json = await this.kendryteWorkspaceService.readProjectSetting(workspaceFolder);
			if (json && json.name) {
				this._projectNameMap.set(json.name, workspaceFolder);
			}
		}
	}
}
