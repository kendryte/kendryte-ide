import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IWorkspaceContextService, IWorkspaceFolder, IWorkspaceFolderData, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { Emitter } from 'vs/base/common/event';
import { ILogService } from 'vs/platform/log/common/log';
import { ERROR_REQUIRE_FOLDER } from 'vs/base/common/messages';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CONTEXT_KENDRYTE_MULTIPLE_PROJECT, CONTEXT_KENDRYTE_NOT_EMPTY } from 'vs/kendryte/vs/services/workspace/common/contextKey';
import { exists } from 'vs/base/node/pfs';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { EXTEND_JSON_MARKER_ID } from 'vs/kendryte/vs/base/common/jsonComments';
import { URI } from 'vs/base/common/uri';
import { createSimpleJsonWarningMarkers } from 'vs/kendryte/vs/platform/marker/common/simple';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import IContextKey = monaco.editor.IContextKey;

class KendryteWorkspaceService implements IKendryteWorkspaceService {
	public _serviceBrand: any;

	private readonly _onCurrentWorkingDirectoryChange = new Emitter<void | string>();
	public readonly onCurrentWorkingDirectoryChange = this._onCurrentWorkingDirectoryChange.event;

	private _currentWorkspace?: IWorkspaceFolderData;
	private _currentWorkspacePath?: string;
	private _allWorkspacePaths: string[];
	private isNotEmpty: IContextKey<boolean>;
	private isMultiple: IContextKey<boolean>;

	constructor(
		@IContextKeyService contextKeyService: IContextKeyService,
		@IWorkspaceContextService public readonly workspaceContextService: IWorkspaceContextService,
		@ILogService private readonly logService: ILogService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@IMarkerService private readonly markerService: IMarkerService,
		@IStorageService private readonly storageService: IStorageService,
	) {
		const my = (item: IWorkspaceFolder) => {
			return item.uri.fsPath === this._currentWorkspacePath;
		};

		this.isNotEmpty = CONTEXT_KENDRYTE_NOT_EMPTY.bindTo(contextKeyService);
		this.isMultiple = CONTEXT_KENDRYTE_MULTIPLE_PROJECT.bindTo(contextKeyService);

		workspaceContextService.onDidChangeWorkspaceFolders((event) => {
			this.flushStatus();

			if (event.removed.findIndex(my) !== -1) {
				if (workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
					this.changeWorkspaceByIndex(-1);
				} else {
					this.changeWorkspaceByIndex(0);
				}
			} else if (event.changed.findIndex(my) !== -1) {
				const newOne = workspaceContextService.getWorkspace().folders.find(my);
				console.log(newOne, newOne === this._currentWorkspace);
				debugger;
			} else if (workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
				this.changeWorkspaceByIndex(-1);
			}
		});

		if (workspaceContextService.getWorkbenchState() !== WorkbenchState.EMPTY) {
			this.flushStatus();
			this.trySwithLastProject();
		}
	}

	private trySwithLastProject() {
		const knownWorkspace = this.storageService.get('lastOpenWorkspace', StorageScope.WORKSPACE, '');
		if (knownWorkspace) {
			try {
				this.changeWorkspaceByName(knownWorkspace);
				return;
			} catch (e) {
			}
		}
		this.changeWorkspaceByIndex(0);
	}

	private rememberSelectedProject() {
		if (this._currentWorkspace) {
			this.storageService.store('lastOpenWorkspace', this._currentWorkspace.name, StorageScope.WORKSPACE);
		} else {
			this.storageService.remove('lastOpenWorkspace', StorageScope.WORKSPACE);
		}
	}

	private flushStatus() {
		this._allWorkspacePaths = this.workspaceContextService.getWorkspace().folders.map((item) => {
			return resolvePath(item.uri.fsPath);
		});

		this.isNotEmpty.set(this._allWorkspacePaths.length !== 0);
		this.isMultiple.set(this._allWorkspacePaths.length > 1);
	}

	requireCurrentWorkspace() {
		if (this._currentWorkspacePath) {
			return this._currentWorkspacePath;
		} else {
			throw new Error(ERROR_REQUIRE_FOLDER);
		}
	}

	requireCurrentWorkspaceFile(...s: string[]) {
		if (this._currentWorkspacePath) {
			return resolvePath(this._currentWorkspacePath, ...s);
		} else {
			throw new Error(ERROR_REQUIRE_FOLDER);
		}
	}

	getCurrentWorkspace() {
		if (this._currentWorkspacePath) {
			return this._currentWorkspacePath;
		} else {
			return '';
		}
	}

	getCurrentFolderName() {
		if (this._currentWorkspace) {
			return this._currentWorkspace.name;
		} else {
			return '';
		}
	}

	getCurrentWorkspaceFile(...s: string[]) {
		if (this._currentWorkspacePath) {
			return resolvePath(this._currentWorkspacePath, ...s);
		} else {
			return '';
		}
	}

	getAllWorkspace() {
		return this._allWorkspacePaths.map((f) => {
			return f;
		});
	}

	getAllWorkspaceFile(...s: string[]) {
		return this._allWorkspacePaths.map((f) => {
			return resolvePath(f, ...s);
		});
	}

	changeWorkspaceByName(name: string) {
		const folder = this.workspaceContextService.getWorkspace().folders.find((item) => {
			return item.name === name;
		});
		if (!folder) {
			throw new Error(`Workspace name ${name} did not opened`);
		}
		this._changeWorkspace(folder);
	}

	changeWorkspaceByPath(path: string) {
		path = resolvePath(path);
		const index = this._allWorkspacePaths.findIndex((wsPath) => {
			return wsPath === path;
		});
		const folder = this.workspaceContextService.getWorkspace().folders[index];
		if (!folder) {
			throw new Error(`Workspace path ${path} did not opened`);
		}
		this._changeWorkspace(folder);
	}

	changeWorkspaceByIndex(index: number) {
		if (index === -1) {
			this._closeWorkspace();
			return;
		}
		const sel = this.workspaceContextService.getWorkspace().folders[index];
		if (!sel) {
			throw new Error(`Workspace index ${index} does not exists`);
		}
		this._changeWorkspace(sel);
	}

	private _closeWorkspace() {
		const actualChanged = !!this._currentWorkspace;
		delete this._currentWorkspace;
		delete this._currentWorkspacePath;

		if (actualChanged) {
			this._onCurrentWorkingDirectoryChange.fire();
		}
	}

	private _changeWorkspace(ws: IWorkspaceFolderData) {
		const newPath = resolvePath(ws.uri.fsPath);
		const actualChanged = this._currentWorkspacePath !== newPath;

		this.logService.info('switch workspace: ' + newPath);

		this._currentWorkspace = ws;
		this._currentWorkspacePath = newPath;

		this.rememberSelectedProject();

		if (actualChanged) {
			this._onCurrentWorkingDirectoryChange.fire(newPath);
		}
	}

	getProjectSetting(root: string) {
		return resolvePath(root, CMAKE_CONFIG_FILE_NAME);
	}

	isKendryteProject(root: string): Promise<boolean> {
		return exists(this.getProjectSetting(root));
	}

	async readProjectSetting(root: string) {
		const file = this.getProjectSetting(root);

		if (!await exists(file)) {
			return null;
		}

		// console.log('load project file: %s', file);
		const { json, warnings } = await this.nodeFileSystemService.readJsonFile(file);

		this.markerService.changeOne(EXTEND_JSON_MARKER_ID, URI.file(file), createSimpleJsonWarningMarkers(warnings));

		return json;
	}

}

registerSingleton(IKendryteWorkspaceService, KendryteWorkspaceService);
