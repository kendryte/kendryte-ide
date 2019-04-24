import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_PROJECT_SETTINGS, ACTION_LABEL_OPEN_PROJECT_SETTINGS } from 'vs/kendryte/vs/base/common/menu/tools';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { localize } from 'vs/nls';
import { URI } from 'vs/base/common/uri';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { exists } from 'vs/base/node/pfs';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';

export class OpenPackageJsonEditorAction extends Action {
	static readonly ID: string = ACTION_ID_OPEN_PROJECT_SETTINGS;
	static readonly LABEL: string = ACTION_LABEL_OPEN_PROJECT_SETTINGS;

	constructor(
		id: string = OpenPackageJsonEditorAction.ID, label: string = OpenPackageJsonEditorAction.LABEL,
		@IEditorService private editorService: IEditorService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IWorkspaceContextService private workspaceContextService: IWorkspaceContextService,
		@INotificationService private notificationService: INotificationService,
		@INodePathService private nodePathService: INodePathService,
		@INodeFileSystemService private nodeFileSystemService: INodeFileSystemService,
		@ICMakeService private cmakeService: ICMakeService,
	) {
		super(id, label);
	}

	async run(switchTab: string): Promise<any> {
		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			this.notificationService.error(localize('workspace.required', 'You must open source folder to do that.'));
			return new Error('Can not use flash manager whithout workspace');
		}

		const file = this.nodePathService.workspaceFilePath(CMAKE_CONFIG_FILE_NAME);
		if (!await exists(file)) {
			await this.nodeFileSystemService.rawWriteFile(file, '{}');
			await this.cmakeService.rescanCurrentFolder();
		}

		const input = this.instantiationService.createInstance(
			KendrytePackageJsonEditorInput,
			URI.file(file),
		);
		return this.editorService.openEditor(input, {
			revealIfOpened: true,
			pinned: true,
		});
	}
}