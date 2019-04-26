import { Action } from 'vs/base/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ACTION_ID_OPEN_FLASH_MANAGER, ACTION_LABEL_OPEN_FLASH_MANAGER } from 'vs/kendryte/vs/base/common/menu/tools';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { URI } from 'vs/base/common/uri';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';

export class OpenFlashManagerAction extends Action {
	public static readonly ID = ACTION_ID_OPEN_FLASH_MANAGER;
	public static readonly LABEL = ACTION_LABEL_OPEN_FLASH_MANAGER;

	constructor(
		id: string = OpenFlashManagerAction.ID, label: string = OpenFlashManagerAction.LABEL,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		const input = this.instantiationService.createInstance(
			FlashManagerEditorInput,
			URI.file(this.kendryteWorkspaceService.requireCurrentWorkspaceFile(PROJECT_CONFIG_FOLDER_NAME, FLASH_MANAGER_CONFIG_FILE_NAME)),
		);
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
