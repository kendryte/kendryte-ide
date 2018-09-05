import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_RUN, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { MaixCMakeCleanupAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/cleanupAction';
import { ICompound, IConfig, IDebugService, ILaunch } from 'vs/workbench/parts/debug/common/debug';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import uri from 'vs/base/common/uri';
import { IEditor } from 'vs/workbench/common/editor';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { INodePathService, MAIX_CONFIG_KEY_DEBUG } from 'vs/workbench/parts/maix/_library/common/type';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { executableExtension } from 'vs/workbench/parts/maix/_library/node/versions';
import { getEnvironment, unsetEnvironment } from 'vs/workbench/parts/maix/_library/common/path';

class WorkspaceMaixLaunch implements ILaunch {
	protected GDB: string;

	protected PYTHON: string;

	constructor(
		protected programFile: string,
		@IEditorService protected editorService: IEditorService,
		@IWorkspaceContextService protected contextService: IWorkspaceContextService,
		@INodePathService protected nodePathService: INodePathService,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IConfigurationService protected configurationService: IConfigurationService,
	) {
		this.GDB = resolvePath(nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-gdb' + executableExtension);
		this.PYTHON = resolvePath(nodePathService.getToolchainPath(), 'share/gdb/python');
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
		const target = this.configurationService.getValue(MAIX_CONFIG_KEY_DEBUG);
		return {
			type: 'gdb',
			request: 'attach',
			name: 'debug maix project',
			executable: this.programFile,
			target: target || '127.0.0.1:3333', // <<== TODO
			remote: true,
			cwd: '${workspaceRoot}',
			internalConsoleOptions: 'openOnSessionStart',
			env: {
				...unsetEnvironment(),
				...getEnvironment(this.nodePathService),
			},
			printCalls: true,
			stopOnEntry: false,
			// showDevDebugOutput: true,
			autorun: [
				// `python for cmd in ['delete breakpoints', 'delete tracepoints', 'load', 'interrupt']: gdb.execute(cmd)`,
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
		@ICMakeService private cmakeService: ICMakeService,
		@IDebugService private debugService: IDebugService,
		@ILogService private logService: ILogService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL);
	}

	async run(): TPromise<void> {
		const file = await this.cmakeService.getOutputFile();
		const launch = this.instantiationService.createInstance(WorkspaceMaixLaunch, file);
		this.logService.info('Debug Config:', launch.getConfiguration());
		await this.debugService.startDebugging(launch, launch.getConfiguration()).then(undefined, (e) => {
			debugger;
			this.notificationService.error('Failed to start debug:\n' + e.message);
			throw e;
		});
	}
}
