import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_GUI_SWITCH_TO_GUI,
	ACTION_ID_GUI_SWITCH_TO_JSON,
	ACTION_LABEL_GUI_SWITCH_TO_GUI,
	ACTION_LABEL_GUI_SWITCH_TO_JSON,
} from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/actionId';
import { vscodeIconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { JsonEditorInputBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';

export class ShowJsonEditorAction extends Action {
	public static readonly ID: string = ACTION_ID_GUI_SWITCH_TO_JSON;
	public static readonly LABEL: string = ACTION_LABEL_GUI_SWITCH_TO_JSON;

	constructor(
		id: string = ShowJsonEditorAction.ID, label: string = ShowJsonEditorAction.LABEL,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super(id, label, vscodeIconClass('json'));
	}

	async run() {
		if (this.editorService.activeEditor instanceof JsonEditorInputBase) {
			await this.editorService.activeEditor.switchTo('json');
		}
	}
}

export class ShowGuiEditorAction extends Action {
	public static readonly ID: string = ACTION_ID_GUI_SWITCH_TO_GUI;
	public static readonly LABEL: string = ACTION_LABEL_GUI_SWITCH_TO_GUI;

	constructor(
		id: string = ShowJsonEditorAction.ID, label: string = ShowJsonEditorAction.LABEL,
		@IEditorService private readonly editorService: IEditorService,
	) {
		super(id, label, vscodeIconClass('PreferencesEditor'));
	}

	async run() {
		if (this.editorService.activeEditor instanceof JsonEditorInputBase) {
			await this.editorService.activeEditor.switchTo('gui');
		}
	}
}

