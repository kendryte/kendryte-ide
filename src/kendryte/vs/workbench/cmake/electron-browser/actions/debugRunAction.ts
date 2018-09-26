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
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { executableExtension } from 'kendryte/vs/platform/node/versions';
import { DebugScript, getEnvironment } from 'kendryte/vs/platform/node/nodeEnv';
import { JSONVisitor, visit } from 'vs/base/common/json';
import * as encoding from 'vs/base/node/encoding';
import { IFileService } from 'vs/platform/files/common/files';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Range } from 'vs/editor/common/core/range';
import { IIdentifiedSingleEditOperation } from 'vs/editor/common/model';
import { Position } from 'vs/editor/common/core/position';
import { generateIndent } from 'vs/editor/contrib/indentation/indentUtils';

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
		return this.contextService.getWorkspace().folders[0].toResource('.vscode/launch.json');
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

	public getConfiguration(name: string = '') {
		const target = this.configurationService.getValue(MAIX_CONFIG_KEY_DEBUG);
		return {
			id: 'kendryte',
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
			resource: this.uri,
		}).then(editor => ({ editor, created: false }));
	}
}

class LaunchVisitor implements JSONVisitor {
	private depthInArray = 0;
	private depthInObject = 0;
	private lastProperty: string;
	private configurationsArrayPosition: number;
	private isInConfig: boolean;
	private lastObjectBegin: number;
	private lastObjectEnd: number;
	private idKendryteFound = false;
	private idKendryteEndFound = false;
	private idKendryteWatchProperty = false;

	constructor() {
		this.onLiteralValue = this.onLiteralValue.bind(this);
		this.onObjectProperty = this.onObjectProperty.bind(this);
		this.onObjectEnd = this.onObjectEnd.bind(this);
		this.onObjectBegin = this.onObjectBegin.bind(this);
		this.onArrayBegin = this.onArrayBegin.bind(this);
		this.onArrayEnd = this.onArrayEnd.bind(this);
	}

	get Result() {
		return {
			arrayPos: this.configurationsArrayPosition,
			found: this.idKendryteFound,
			start: this.lastObjectBegin,
			end: this.lastObjectEnd,
		};
	}

	onLiteralValue(value: any, offset: number, length: number) {
		if (!this.idKendryteFound && this.idKendryteWatchProperty && value === 'kendryte') {
			this.idKendryteFound = true;
		}
	}

	onObjectProperty(property, offset, length) {
		this.lastProperty = property;

		if (!this.idKendryteFound && this.depthInObject === 1 && property === 'id') { // try to find id=kendryte
			this.idKendryteWatchProperty = true;
		}
	}

	onObjectEnd(offset: number, length: number) {
		if (!this.isInConfig || this.idKendryteEndFound) {
			return;
		}
		this.depthInObject--;
		if (this.depthInObject === 0 && this.idKendryteFound) {
			this.lastObjectEnd = offset + 1;
			this.idKendryteEndFound = true;
		}
	}

	onObjectBegin(offset: number, length: number) {
		if (!this.isInConfig || this.idKendryteEndFound) {
			return;
		}
		if (this.depthInObject === 0) {
			this.lastObjectBegin = offset;
		}
		this.depthInObject++;
	}

	onArrayBegin(offset: number, length: number) {
		if (this.lastProperty === 'configurations' && this.depthInArray === 0) {
			this.configurationsArrayPosition = offset + 1;
			this.isInConfig = true;
		}
		this.depthInArray++;
	}

	onArrayEnd() {
		this.depthInArray--;
		if (this.depthInArray === 0) {
			// go out of `configurations`
			this.isInConfig = false;
		}
	}
}

export class MaixCMakeDebugAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = localize('Debug', 'Debug');
	private readonly disposeArr: IDisposable[] = [];

	constructor(
		id = MaixCMakeCleanupAction.ID, label = MaixCMakeCleanupAction.LABEL,
		@ICMakeService private cmakeService: ICMakeService,
		@IDebugService private debugService: IDebugService,
		@ILogService private logService: ILogService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@INotificationService private notificationService: INotificationService,
		@IFileService private fileService: IFileService,
		@ITextModelService private textModelService: ITextModelService,
	) {
		super(MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL);
	}

	dispose() {
		super.dispose();
		dispose(this.disposeArr);
		this.disposeArr.length = 0;
	}

	protected async saveToLaunchJson(config: ILaunch) {
		const resource = config.uri;
		const exists = await this.fileService.existsFile(resource);
		if (!exists) {
			this.fileService.updateContent(resource, '{}', { encoding: encoding.UTF8 });
		}
		const textModelRef = await this.textModelService.createModelReference(resource);
		this.disposeArr.push(textModelRef);

		if (textModelRef.object.isReadonly()) {
			throw new Error('readonly. please check your permission.');
		}

		const model = textModelRef.object.textEditorModel;

		const visitor = new LaunchVisitor();

		visit(model.getValue(), visitor);

		const result = visitor.Result;

		let configContent = indent(generateIndent(8, 4, true), JSON.stringify(config.getConfiguration('kendryte'), null, 4));

		let edits: IIdentifiedSingleEditOperation[] = [];
		if (result.found) {
			edits.push({
				range: Range.fromPositions(model.getPositionAt(result.start), model.getPositionAt(result.end)),
				text: configContent.trim(),
			});
		} else {
			const arrayPos = model.getPositionAt(result.arrayPos);
			const lastChar = model.getLineLastNonWhitespaceColumn(arrayPos.lineNumber);
			// Check if there are more characters on a line after a "configurations": [, if yes enter a newline
			if (lastChar > arrayPos.column) {
				configContent = '\n' + configContent + ',\n';
			} else {
				configContent = '\n' + configContent + ',';
			}
			const newPos = new Position(arrayPos.lineNumber, lastChar);
			edits.push({
				range: Range.fromPositions(newPos, newPos),
				text: configContent,
			});
		}
		model.applyEdits(edits);

		textModelRef.dispose();
	}

	async run(): TPromise<void> {
		const file = await this.cmakeService.getOutputFile();
		const myLaunch = this.instantiationService.createInstance(WorkspaceMaixLaunch, file);
		const config = myLaunch.getConfiguration();

		this.logService.info('Debug Config:', config);
		const buildDir = config.env.PWD || resolvePath(myLaunch.workspace.uri.fsPath, 'build');

		const dbg = new DebugScript(buildDir, config.env);
		dbg.command(config.gdbpath, [
			'--eval',
			`target remote ${config.target}`,
			config.executable,
		]);
		dbg.writeBack(myLaunch.workspace.uri.fsPath, 'debug');

		await this.saveToLaunchJson(myLaunch).catch((e) => {
			e.message = 'invalid launch.json: ' + e.message;
			myLaunch.openConfigFile(false, false);
			throw e;
		});

		const handle = this.notificationService.notify({
			severity: Severity.Info,
			message: `connecting to ${config.target}...`,
		});
		handle.progress.infinite();

		await this.debugService.startDebugging(myLaunch, 'kendryte').then(undefined, (e) => {
			debugger;
			this.notificationService.error('Failed to start debug:\n' + e.message);
			throw e;
		});

		handle.close();
	}
}

function indent(tab: string, txt: string) {
	return txt.replace(/^/mg, tab);
}