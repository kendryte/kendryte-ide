import { ICompound, ILaunch } from 'vs/workbench/parts/debug/common/debug';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { getEnvironment } from 'vs/kendryte/vs/workbench/cmake/node/environmentVars';
import { TPromise } from 'vs/base/common/winjs.base';
import { IEditor } from 'vs/workbench/common/editor';
import { JSONVisitor } from 'vs/base/common/json';

export class WorkspaceMaixLaunch implements ILaunch {
	protected GDB: string;

	constructor(
		protected port: number,
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
		return {
			id: 'kendryte',
			type: 'kendryte',
			request: 'launch',
			name: 'Kendryte: Debug with OpenOCD',
			executable: this.programFile,
			target: `127.0.0.1:${this.port}`,
			remote: true,
			cwd: '${workspaceRoot}/build',
			internalConsoleOptions: 'openOnSessionStart' as any,
			env: {
				...getEnvironment(this.nodePathService),
			},
			printCalls: true,
			stopOnAttach: false,
			autorun: [],
			gdbpath: this.GDB,
		};
	}

	openConfigFile(sideBySide: boolean, preserveFocus: boolean, type?: string): TPromise<{ editor: IEditor, created: boolean }> {
		return this.editorService.openEditor({
			resource: this.uri,
		}).then(editor => ({ editor, created: false }));
	}
}

export class LaunchVisitor implements JSONVisitor {
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
