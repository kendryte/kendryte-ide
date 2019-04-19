import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { URI } from 'vs/base/common/uri';

export interface IFlashManagerService {
	_serviceBrand: any;

	openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor | null>;
}

export const IFlashManagerService = createDecorator<IFlashManagerService>('flashManagerEditorService');
