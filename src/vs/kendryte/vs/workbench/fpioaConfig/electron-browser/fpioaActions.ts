import { Action } from 'vs/base/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { FpioaEditorInput } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ACTION_ID_OPEN_FPIOA_EDIT, ACTION_LABEL_OPEN_FPIOA_EDIT } from 'vs/kendryte/vs/base/common/menu/tools';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { FPIOA_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { URI } from 'vs/base/common/uri';

export class FpioaEditorAction extends Action {
	public static readonly ID = ACTION_ID_OPEN_FPIOA_EDIT;
	public static readonly LABEL = ACTION_LABEL_OPEN_FPIOA_EDIT;

	constructor(
		id: string,
		label: string,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IKendryteWorkspaceService private kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		const resource = this.kendryteWorkspaceService.requireCurrentWorkspaceFile(PROJECT_CONFIG_FOLDER_NAME, FPIOA_FILE_NAME);
		const input = this.instantiationService.createInstance(FpioaEditorInput, URI.file(resource));
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
