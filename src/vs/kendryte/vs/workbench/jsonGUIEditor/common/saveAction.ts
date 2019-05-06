import { Action } from 'vs/base/common/actions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { localize } from 'vs/nls';
import { CustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';
import { AbstractJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';

const ACTION_ID_CUSTOM_JSON_EDITOR_SAVE = 'workbench.action.kendryte.json.sasve';
const ACTION_LABEL_CUSTOM_JSON_EDITOR_SAVE = localize('save', 'Save');

export class SaveAction extends Action {
	static readonly ID = ACTION_ID_CUSTOM_JSON_EDITOR_SAVE;
	static readonly LABEL = ACTION_LABEL_CUSTOM_JSON_EDITOR_SAVE;

	constructor(
		id = SaveAction.ID, label = SaveAction.LABEL,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super(id, label);
	}

	async run() {
		if (this.editorService.activeEditor) {
			const id = this.editorService.activeEditor.getTypeId();
			if (CustomJsonRegistry.isResisted(id)) {
				await (this.editorService.activeEditor as AbstractJsonEditorInput<any>).save();
			}
		}
	}
}
