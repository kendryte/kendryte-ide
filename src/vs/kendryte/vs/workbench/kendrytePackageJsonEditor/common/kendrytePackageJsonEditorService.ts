import { TPromise } from 'vs/base/common/winjs.base';
import { IEditorGroup } from 'vs/workbench/services/group/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { URI } from 'vs/base/common/uri';

export interface IKendrytePackageJsonEditorService {
	_serviceBrand: any;

	openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): TPromise<IEditor>;
}

export const IKendrytePackageJsonEditorService = createDecorator<IKendrytePackageJsonEditorService>('kendrytePackageJsonEditorService');
