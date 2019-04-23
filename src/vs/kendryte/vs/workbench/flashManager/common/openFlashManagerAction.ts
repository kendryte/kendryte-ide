import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_OPEN_FLASH_MANAGER, ACTION_LABEL_OPEN_FLASH_MANAGER } from 'vs/kendryte/vs/base/common/menu/tools';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { URI } from 'vs/base/common/uri';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';

export class OpenFlashManagerAction extends Action {
	public static readonly ID = ACTION_ID_OPEN_FLASH_MANAGER;
	public static readonly LABEL = ACTION_LABEL_OPEN_FLASH_MANAGER;

	constructor(
		id: string = OpenFlashManagerAction.ID, label: string = OpenFlashManagerAction.LABEL,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@INotificationService private notificationService: INotificationService,
		@INodePathService private nodePathService: INodePathService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			this.notificationService.error(localize('workspace.required', 'You must open source folder to do that.'));
			return new Error('Can not use flash manager whithout workspace');
		}

		const input = this.instantiationService.createInstance(
			FlashManagerEditorInput,
			URI.file(this.nodePathService.workspaceFilePath(PROJECT_CONFIG_FOLDER_NAME + '/' + FLASH_MANAGER_CONFIG_FILE_NAME)),
		);
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
