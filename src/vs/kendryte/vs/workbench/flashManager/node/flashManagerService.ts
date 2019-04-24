import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { resolve } from 'vs/base/common/path';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { localize } from 'vs/nls';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';

const DONT_MODIFY_MARKER = localize('dontModifyMarker', 'DO NOT MODIFY THIS FILE, IT WILL BE OVERRIDE!!!');
const MARKER_ID = 'flash.manager.service';

export class FlashManagerService implements IFlashManagerService {
	_serviceBrand: any;
	private readonly logger: IChannelLogger;

	constructor(
		@ISerialPortService serialPortService: ISerialPortService,
		@ICMakeService cmakeService: ICMakeService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IMarkerService private readonly markerService: IMarkerService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);

		cmakeService.onPrepareBuild((event) => {
			event.waitUntil(this.runGenerateMemoryMap());
		});
	}

	async openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor | null> {
		const input = this.instantiationService.createInstance(FlashManagerEditorInput, resource);
		return this.editorService.openEditor(input, options, group);
	}

	get currentConfigFile(): URI {
		const config = resolve(this.nodePathService.workspaceFilePath(), PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME);
		return URI.file(config);
	}

	async getFlashManagerModel(): Promise<FlashManagerEditorModel> {
		const config = this.currentConfigFile;
		this.logger.info(`Reading config file: ${config.fsPath}`);
		const model = this.instantiationService.createInstance(FlashManagerEditorModel, config);
		await model.load();
		return model;
	}

	async runGenerateMemoryMap(model?: FlashManagerEditorModel) {
		if (!model) {
			model = await this.getFlashManagerModel();
		}
		try {
			await this._runGenerateMemoryMap(model);
			this.markerService.changeAll(MARKER_ID, []);
		} catch (e) {
			this.logger.error('    error: ' + e.message);
			const sourceFilePath = model!.resource.fsPath.replace(/\.json$/i, '.h');
			const showErrorMessage = localize('cppErrorFlashManager', 'There are error(s) in flash manager, please fix them before compile');
			this.logger.info(showErrorMessage);
			await this.nodeFileSystemService.writeFileIfChanged(sourceFilePath, `#error "${showErrorMessage}"\n`);
			this.markerService.changeAll(MARKER_ID, [
				{
					resource: this.currentConfigFile,
					marker: {
						severity: MarkerSeverity.Error,
						message: showErrorMessage,
						startLineNumber: 0,
						startColumn: 0,
						endLineNumber: 0,
						endColumn: 0,
					},
				},
				{
					resource: this.currentConfigFile,
					marker: {
						severity: MarkerSeverity.Error,
						message: e.message,
						startLineNumber: 0,
						startColumn: 0,
						endLineNumber: 0,
						endColumn: 0,
					},
				},
			]);
			throw e;
		}
	}

	async _runGenerateMemoryMap(model: FlashManagerEditorModel) {
		this.logger.info('generating flash manager source file...');
		const createdFileContents = [
			'// ' + DONT_MODIFY_MARKER,
			'#ifndef KENDRYTE_IDE_FLASH_MANGER_OUT',
			'#define KENDRYTE_IDE_FLASH_MANGER_OUT',
		];

		for (const item of await model!.createSections()) {
			createdFileContents.push(`#define ${item.varName}_START ${item.startHex}`);
			createdFileContents.push(`#define ${item.varName}_END ${item.endHex}`);
			createdFileContents.push(`#define ${item.varName}_SIZE ${item.size}`);
		}

		createdFileContents.push('#endif');

		const sourceFilePath = model!.resource.fsPath.replace(/\.json$/i, '.h');

		this.logger.info('    write to ' + sourceFilePath);
		await this.nodeFileSystemService.writeFileIfChanged(sourceFilePath, createdFileContents.join('\n') + '\n');
	}
}
