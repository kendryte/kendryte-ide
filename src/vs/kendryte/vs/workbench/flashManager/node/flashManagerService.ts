import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { localize } from 'vs/nls';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { exists } from 'vs/base/node/pfs';
import { IBeforeBuildEvent } from 'vs/kendryte/vs/services/makefileService/common/type';
import { createSimpleErrorMarker } from 'vs/kendryte/vs/platform/marker/common/simple';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { MemoryAllocationCalculator, parseMemoryAddress } from 'vs/kendryte/vs/platform/serialPort/flasher/common/memoryAllocationCalculator';
import { wrapHeaderFile } from 'vs/kendryte/vs/base/common/cpp/wrapHeaderFile';
import { ICustomJsonEditorService } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { URI } from 'vs/base/common/uri';
import { IFlashManagerConfigJson } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { DisposableSet } from 'vs/kendryte/vs/base/common/lifecycle/disposableSet';

const MARKER_ID = 'flash.manager.service';
const CONST_NAME = 'KENDRYTE_IDE_FLASH_MANGER_OUT';

export class FlashManagerService implements IFlashManagerService {
	_serviceBrand: any;
	private readonly logger: IChannelLogger;

	constructor(
		@ISerialPortService serialPortService: ISerialPortService,
		@IChannelLogService channelLogService: IChannelLogService,
		@ICustomJsonEditorService private readonly customJsonEditorService: ICustomJsonEditorService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	handlePrecompileEvent(event: IBeforeBuildEvent) {
		const disposableSet = new DisposableSet<FlashManagerEditorModel>();
		return this._handlePrecompileEvent(event, disposableSet).finally(() => {
			disposableSet.dispose();
		});
	}

	private async _handlePrecompileEvent(event: IBeforeBuildEvent, _disposables: DisposableSet<FlashManagerEditorModel>) {
		const mainFile = resolvePath(event.projects[0].path, PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME);
		const mainModel = await this.getFlashManagerModel(mainFile);
		_disposables.add(mainModel);
		const memory = new MemoryAllocationCalculator(parseMemoryAddress(mainModel.data.baseAddress), Infinity);

		for (const project of event.projects) {
			const configFile = resolvePath(project.path, PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME);
			if (await exists(configFile)) {
				this.logger.info('[Flash Manager] Enabled for %s.', project.json.name);
				const model = await this.getFlashManagerModel(configFile);
				_disposables.add(model);
				await this.runGenerateMemoryMap(model, memory);
			} else {
				this.logger.info('[Flash Manager] NOT enabled for %s.', project.json.name);
			}
		}
	}

	async getFlashManagerModel(fsPath: string) {
		const model = this.customJsonEditorService.createJsonModel<IFlashManagerConfigJson>(URI.file(fsPath), FlashManagerEditorModel)!;
		console.assert(model, 'not registered');
		await model.load();
		return model as FlashManagerEditorModel;
	}

	public async runGenerateMemoryMap(model: FlashManagerEditorModel, memory?: MemoryAllocationCalculator) {
		try {
			await this._runGenerateMemoryMap(model, memory);
			this.markerService.changeAll(MARKER_ID, []);
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

		return sourceFilePath;
	}
}
