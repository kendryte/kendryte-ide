import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_PROJECT_SETTINGS, ACTION_LABEL_OPEN_PROJECT_SETTINGS } from 'vs/kendryte/vs/base/common/menu/tools';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { URI } from 'vs/base/common/uri';
import { ICustomJsonEditorService } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { KENDRYTE_PACKAGE_JSON_EDITOR_ID } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';

export class OpenPackageJsonEditorAction extends Action {
	static readonly ID: string = ACTION_ID_OPEN_PROJECT_SETTINGS;
	static readonly LABEL: string = ACTION_LABEL_OPEN_PROJECT_SETTINGS;

	constructor(
		id: string = OpenPackageJsonEditorAction.ID, label: string = OpenPackageJsonEditorAction.LABEL,
		@IEditorService private editorService: IEditorService,
		@ICustomJsonEditorService private customJsonEditorService: ICustomJsonEditorService,
		@INotificationService private notificationService: INotificationService,
		@IKendryteWorkspaceService private kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		if (this.kendryteWorkspaceService.isEmpty()) {
			this.notificationService.error(localize('workspace.required', 'You must open source folder to do that.'));
			return new Error('Can not use flash manager whithout workspace');
		}

		const file = this.kendryteWorkspaceService.requireCurrentWorkspaceFile(CMAKE_CONFIG_FILE_NAME);
		const input = this.customJsonEditorService.openEditorAs(URI.file(file), KENDRYTE_PACKAGE_JSON_EDITOR_ID);
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}
