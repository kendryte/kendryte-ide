import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { FpgioEditorInput } from 'vs/workbench/parts/maix/fpgio-config/browser/fpgioEditorInput';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';

export class FpgioEditorAction extends Action {
	public static readonly ID = 'workbench.action.openMaixIOConfigureWindow';
	public static readonly LABEL = localize('MaixIOEditor', 'Edit Maix IO function');

	constructor(
		id: string,
		label: string,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	async run(switchTab: string): TPromise<any> {
		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			this.notificationService.error(localize('workspace.required', 'You must open source folder to do that.'));
			return new Error('Can not edit FPGIO whithout workspace');
		}

		const input = this.instantiationService.createInstance(FpgioEditorInput, '{}');
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
