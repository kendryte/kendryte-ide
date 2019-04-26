import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { localize } from 'vs/nls';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { exists } from 'vs/base/node/pfs';
import { IBeforeBuild, ICompileService } from 'vs/kendryte/vs/services/compileService/common/type';
import { createSimpleErrorMarker } from 'vs/kendryte/vs/platform/marker/common/simple';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { MemoryAllocationCalculator, parseMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { wrapHeaderFile } from 'vs/kendryte/vs/base/common/cpp/wrapHeaderFile';

const MARKER_ID = 'flash.manager.service';
const CONST_NAME = 'KENDRYTE_IDE_FLASH_MANGER_OUT';

export class FlashManagerService implements IFlashManagerService {
	_serviceBrand: any;
	private readonly logger: IChannelLogger;

	constructor(
		@ISerialPortService serialPortService: ISerialPortService,
		@ICompileService compileService: ICompileService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		compileService.onPrepareBuild((event) => event.waitUntil(this.runIfExists(event)));
	}

	async runIfExists(event: IBeforeBuild) {
		const mainFile = resolvePath(event.mainProject.projectPath, PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME);
		const mainModel = await this.getFlashManagerModel(mainFile);
		const memory = new MemoryAllocationCalculator(parseMemoryAddress(mainModel.data.baseAddress), Infinity);

		for (const project of event.projects) {
			const configFile = resolvePath(project.projectPath, PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME);
			if (await exists(configFile)) {
				this.logger.info('[Flash Manager] Enabled for %s.', project.json.name);
				const model = await this.getFlashManagerModel(configFile);
				await this.runGenerateMemoryMap(model, memory);
			} else {
				this.logger.info('[Flash Manager] NOT enabled for %s.', project.json.name);
			}
		}
	}

	async openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor | null> {
		const input = this.instantiationService.createInstance(FlashManagerEditorInput, resource);
		return this.editorService.openEditor(input, options, group);
	}

	getFlashManagerModelNotResolved(resource: string): FlashManagerEditorModel {
		return this.instantiationService.createInstance(FlashManagerEditorModel, URI.file(resource));
	}

	async getFlashManagerModel(resource: string): Promise<FlashManagerEditorModel> {
		this.logger.info(`Reading config file: ${resource}`);
		const model = this.getFlashManagerModelNotResolved(resource);
		await model.load();
		return model;
	}

	public async runGenerateMemoryMap(model: FlashManagerEditorModel, memory?: MemoryAllocationCalculator) {
		try {
			await this._runGenerateMemoryMap(model, memory);
			this.markerService.changeAll(MARKER_ID, []);
			return model;
		} catch (e) {
			this.logger.error('    error: ' + e.message);
			const sourceFilePath = model!.resource.fsPath.replace(/\.json$/i, '.h');
			const showErrorMessage = localize('cppErrorFlashManager', 'There are error(s) in flash manager, please fix them before compile');
			this.logger.info(showErrorMessage);
			await this.nodeFileSystemService.writeFileIfChanged(sourceFilePath, `#error "${showErrorMessage}"\n`);
			this.markerService.changeOne(MARKER_ID, model.resource, [
				createSimpleErrorMarker(showErrorMessage),
				createSimpleErrorMarker(e),
			]);
			throw e;
		}
	}

	private async _runGenerateMemoryMap(model: FlashManagerEditorModel, memory?: MemoryAllocationCalculator) {
		this.logger.info('generating flash manager source file...');
		const createdFileContents = [];

		for (const item of await model.createSections(memory)) {
			createdFileContents.push(`#define ${item.varName}_START ${item.startHex}`);
			createdFileContents.push(`#define ${item.varName}_END ${item.endHex}`);
			createdFileContents.push(`#define ${item.varName}_SIZE ${item.size}`);
		}

		const sourceFilePath = model.resource.fsPath.replace(/\.json$/i, '.h');

		this.logger.info('    write to ' + sourceFilePath);
		await this.nodeFileSystemService.writeFileIfChanged(sourceFilePath, wrapHeaderFile(createdFileContents.join('\n'), CONST_NAME) + '\n');
	}
}
