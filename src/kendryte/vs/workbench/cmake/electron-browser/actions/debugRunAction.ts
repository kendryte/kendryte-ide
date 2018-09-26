import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_RUN, INodePathService, MAIX_CONFIG_KEY_DEBUG } from 'kendryte/vs/platform/common/type';
import { ICMakeService } from 'kendryte/vs/workbench/cmake/common/type';
import { MaixCMakeCleanupAction } from 'kendryte/vs/workbench/cmake/electron-browser/actions/cleanupAction';
import { ICompound, IDebugService, ILaunch } from 'vs/workbench/parts/debug/common/debug';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { URI } from 'vs/base/common/uri';
import { IEditor } from 'vs/workbench/common/editor';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolvePath } from 'kendryte/vs/platform/node/resolvePath';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { executableExtension } from 'kendryte/vs/platform/node/versions';
import { DebugScript, getEnvironment } from 'kendryte/vs/platform/node/nodeEnv';

class WorkspaceMaixLaunch implements ILaunch {
	protected GDB: string;

	constructor(
		protected programFile: string,
		@IEditorService protected editorService: IEditorService,
		@IWorkspaceContextService protected contextService: IWorkspaceContextService,
		@INodePathService protected nodePathService: INodePathService,
		@IEnvironmentService environmentService: IEnvironmentService,
		@IConfigurationService protected configurationService: IConfigurationService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
	) {
		this.GDB = resolvePath(nodePathService.getToolchainBinPath(), 'riscv64-unknown-elf-gdb' + executableExtension);
	}

	public get workspace(): IWorkspaceFolder {
		return this.workspaceContextService.getWorkspace().folders[0];
	}

	public get uri(): URI {
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

	public getConfiguration() {
		const target = this.configurationService.getValue(MAIX_CONFIG_KEY_DEBUG);
		return {
			type: 'gdb',
			request: 'attach',
			name: 'debug maix project',
			executable: this.programFile,
			target: target || '127.0.0.1:3333', // <<== TODO
			remote: true,
			cwd: '${workspaceRoot}/build',
			internalConsoleOptions: 'openOnSessionStart' as any,
			env: {
				...getEnvironment(this.nodePathService),
			},
			printCalls: true,
			stopOnEntry: false,
			showDevDebugOutput: false,
			autorun: [
				`python for cmd in ['delete breakpoints', 'delete tracepoints', 'load']: gdb.execute(cmd)`,
			],
			gdbpath: this.GDB,
		};
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
		const config = launch.getConfiguration();

		this.logService.info('Debug Config:', config);
		const buildDir = config.env.PWD || resolvePath(launch.workspace.uri.fsPath, 'build');

		const dbg = new DebugScript(buildDir, config.env);
		dbg.command(config.gdbpath, [
			'--eval',
			`target remote ${config.target}`,
			config.executable,
		]);
		dbg.writeBack(launch.workspace.uri.fsPath, 'debug');

		await this.debugService.startDebugging(launch, config).then(undefined, (e) => {
			debugger;
			this.notificationService.error('Failed to start debug:\n' + e.message);
			throw e;
		});
	}
}
