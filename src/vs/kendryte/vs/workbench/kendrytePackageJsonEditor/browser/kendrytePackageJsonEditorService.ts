import { IKendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/kendrytePackageJsonEditorService';
import { IEditorGroup } from 'vs/workbench/services/group/common/editorGroupsService';
import { IEditor } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';

export class KendrytePackageJsonEditorService implements IKendrytePackageJsonEditorService {
	public _serviceBrand: any;

	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
	}

	public async openEditor(resource: URI, options?: IEditorOptions, group?: IEditorGroup): Promise<IEditor> {
		const input = this.instantiationService.createInstance(KendrytePackageJsonEditorInput, resource);
		return this.editorService.openEditor(input, options, group);
	}
}
