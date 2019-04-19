import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';

export class FlashManagerService implements IFlashManagerService {
	_serviceBrand: any;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@ISerialPortService serialPortService: ISerialPortService,
	) {

	}

	async openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor | null> {
		const input = this.instantiationService.createInstance(FlashManagerEditorInput, resource);
		return this.editorService.openEditor(input, options, group);
	}
}
