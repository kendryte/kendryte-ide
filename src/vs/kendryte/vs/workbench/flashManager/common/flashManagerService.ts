import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorModel } from 'vs/kendryte/vs/workbench/flashManager/common/editorModel';

export interface IFlashManagerService {
	_serviceBrand: any;

	getFlashManagerModel(fsPath: string): Promise<FlashManagerEditorModel>;
	runGenerateMemoryMap(model: FlashManagerEditorModel): Promise<void>;
}

export const IFlashManagerService = createDecorator<IFlashManagerService>('flashManagerEditorService');
