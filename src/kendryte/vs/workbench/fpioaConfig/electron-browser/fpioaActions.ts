import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { FpioaEditorInput } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';

export class FpioaEditorAction extends Action {
	public static readonly ID = 'workbench.action.kendryte.openIOConfig';
	public static readonly LABEL = localize('KendryteIOEditor', 'Edit Kendryte IO function');

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

	async run(switchTab: string): TPromise<any> {
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
