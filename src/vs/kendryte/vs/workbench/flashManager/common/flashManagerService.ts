import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';
import { IBeforeBuildEvent } from 'vs/kendryte/vs/services/makefileService/common/type';

export interface IFlashManagerService {
	_serviceBrand: any;

	handlePrecompileEvent(event: IBeforeBuildEvent): Promise<void>;
	getFlashManagerModel(fsPath: string): Promise<FlashManagerEditorModel>;
	runGenerateMemoryMap(model: FlashManagerEditorModel): Promise<void>;
}

export const IFlashManagerService = createDecorator<IFlashManagerService>('flashManagerEditorService');
