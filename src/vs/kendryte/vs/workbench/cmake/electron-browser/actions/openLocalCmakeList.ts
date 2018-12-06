import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_CMAKE_LIST_CONFIG } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { exists, writeFile } from 'vs/base/node/pfs';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { URI } from 'vs/base/common/uri';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export class OpenLocalCmakeListAction extends Action {
	static readonly ID = ACTION_ID_OPEN_CMAKE_LIST_CONFIG;
	static readonly LABEL = localize('open', 'Open {1}', CMAKE_CONFIG_FILE_NAME);

	constructor(
		id: string = OpenLocalCmakeListAction.ID, label: string = OpenLocalCmakeListAction.LABEL,
		@INodePathService private readonly nodePathService: INodePathService,
		@IEditorService private readonly editorService: IEditorService,
		@ICMakeService private readonly cMakeService: ICMakeService,
	) {
		super(id, label);
	}

	async run(): TPromise<void> {
		this.cMakeService.rescanCurrentFolder();

		const file = this.nodePathService.workspaceFilePath(CMAKE_CONFIG_FILE_NAME);
		if (!await exists(file)) {
			await writeFile(file, `{
	// cmake config file
	"$schema": "vscode://schemas/CMakeLists",
}`);
		}

		await this.editorService.openEditor({ resource: URI.file(file) });

		return;
	}
}