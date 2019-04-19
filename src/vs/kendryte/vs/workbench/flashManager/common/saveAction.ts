import { Action } from 'vs/base/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';

export class SaveFlashConfigAction extends Action {
	static readonly ID = 'save.flash.manager.config';
	static readonly LABEL = 'Save';

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
