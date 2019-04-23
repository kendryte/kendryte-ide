import { Action } from 'vs/base/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { localize } from 'vs/nls';

const ACTION_ID_FLASH_MANAGER_SAVE = 'workbench.action.kendryte.flashManager.sasve';
const ACTION_LABEL_FLASH_MANAGER_SAVE = localize('save', 'Save');

export class SaveFlashConfigAction extends Action {
	static readonly ID = ACTION_ID_FLASH_MANAGER_SAVE;
	static readonly LABEL = ACTION_LABEL_FLASH_MANAGER_SAVE;

	constructor(
		id = SaveFlashConfigAction.ID, label = SaveFlashConfigAction.LABEL,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super(id, label);
	}

	async run() {
		if (this.editorService.activeEditor && this.editorService.activeEditor.getTypeId() === FlashManagerEditorInput.ID) {
			await (this.editorService.activeEditor as FlashManagerEditorInput).save();
		}
	}
}
