import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { FpioaEditorInput } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_OPEN_FPIOA_EDIT, ACTION_LABEL_OPEN_FPIOA_EDIT } from 'vs/kendryte/vs/base/common/menu/tools';

export class FpioaEditorAction extends Action {
	public static readonly ID = ACTION_ID_OPEN_FPIOA_EDIT;
	public static readonly LABEL = ACTION_LABEL_OPEN_FPIOA_EDIT;

	constructor(
		id: string,
		label: string,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			this.notificationService.error(localize('workspace.required', 'You must open source folder to do that.'));
			return new Error('Can not edit fpioa whithout workspace');
		}

		const input = this.instantiationService.createInstance(FpioaEditorInput, '{}');
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
