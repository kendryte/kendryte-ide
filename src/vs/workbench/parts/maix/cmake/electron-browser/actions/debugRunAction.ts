import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_RUN, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IOutputService } from 'vs/workbench/parts/output/common/output';
import { MaixCMakeCleanupAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/cleanupAction';
import { ICompound, IConfig, IDebugService, ILaunch } from 'vs/workbench/parts/debug/common/debug';
import { IProgressService2 } from 'vs/workbench/services/progress/common/progress';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import uri from 'vs/base/common/uri';
import { IEditor } from 'vs/workbench/common/editor';
import { getToolchainBinPath } from 'vs/workbench/parts/maix/_library/node/nodePath';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolve } from 'path';

class WorkspaceMaixLaunch implements ILaunch {
	protected GDB: string;

	constructor(
		protected programFile: string,
		@IEditorService protected editorService: IEditorService,
		@IWorkspaceContextService protected contextService: IWorkspaceContextService,
		@IEnvironmentService environmentService: IEnvironmentService,
	) {
		this.GDB = resolve(getToolchainBinPath(environmentService), 'riscv64-unknown-elf-gdb');
	}

	public get workspace(): IWorkspaceFolder {
		return undefined;
	}

	public get uri(): uri {
		return this.contextService.getWorkspace().configuration;
	}

	public get name(): string {
		return localize('workspace', 'workspace');
	}

	public get hidden(): boolean {
		return true;
	}

	public getCompound(name: string): ICompound {
		return null;
	}

	public getConfigurationNames(includeCompounds = true): string[] {
		return ['default'];
	}

	public getConfiguration(): IConfig {
		return {
			type: 'gdb',
			request: 'attach',
			name: 'debug maix project',
			executable: this.programFile,
			target: 'maix3:3333', // <<== TODO
			remote: true,
			cwd: '${workspaceRoot}',
			internalConsoleOptions: 'openOnSessionStart',
			autorun: [
				'load',
			],
			gdbpath: this.GDB,
		} as IConfig;
	}

	openConfigFile(sideBySide: boolean, preserveFocus: boolean, type?: string): TPromise<{ editor: IEditor, created: boolean }> {
		return this.editorService.openEditor({
			resource: this.contextService.getWorkspace().folders[0].toResource('.vscode/maix.json'),
		}).then(editor => ({ editor, created: false }));
	}
}

export class MaixCMakeDebugAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = localize('Debug', 'Debug');

	constructor(
		id = MaixCMakeCleanupAction.ID, label = MaixCMakeCleanupAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@IDebugService protected debugService: IDebugService,
		@IProgressService2 protected progressService: IProgressService2,
		@IInstantiationService protected instantiationService: IInstantiationService,
		@INotificationService protected notificationService: INotificationService,
	) {
		super(MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL);
	}

	async run(): TPromise<void> {
		const file = await this.cmakeService.getOutputFile();
		const launch = this.instantiationService.createInstance(WorkspaceMaixLaunch, file);
		console.log(launch.getConfiguration());
		await this.debugService.startDebugging(launch, launch.getConfiguration());
	}
}
