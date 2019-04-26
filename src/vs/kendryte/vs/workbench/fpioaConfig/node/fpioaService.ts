import { IFpioaService } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IEditor } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IBeforeBuild, ICompileService } from 'vs/kendryte/vs/services/compileService/common/type';
import { exists } from 'vs/base/node/pfs';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { FPIOA_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { FpioaEditorInput } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';

export class FpioaService implements IFpioaService {
	public _serviceBrand: any;

	private readonly logger: IChannelLogger;

	constructor(
		@ICompileService compileService: ICompileService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
	) {
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
		compileService.onPrepareBuild((event) => event.waitUntil(this.runIfExists(event)));
	}

	async runIfExists(event: IBeforeBuild) {
		for (const project of event.projects) {
			const configFile = resolvePath(project.projectPath, PROJECT_CONFIG_FOLDER_NAME, FPIOA_FILE_NAME);
			if (await exists(configFile)) {
				this.logger.info('[FPIOA Editor] Enabled for %s.', project.json.name);
				project.registerConstructor({
					header: 'fpioa-config.h',
					source: 'fpioa-config.c',
					functionName: 'configure_fpioa',
				});
			} else {
				this.logger.info('[FPIOA Editor] NOT enabled for %s.', project.json.name);
			}
		}
	}

	async openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor | null> {
		const input = this.instantiationService.createInstance(FpioaEditorInput, resource);
		return this.editorService.openEditor(input, options, group);
	}
}

registerSingleton(IFpioaService, FpioaService);
