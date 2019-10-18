import { ITerminalProcessManager, ProcessState, IBeforeProcessDataEvent, ITerminalDimensions, IShellLaunchConfig } from 'vs/workbench/contrib/terminal/common/terminal';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';

export class FakeTerminalProcessManager extends Disposable implements ITerminalProcessManager {
	processState = ProcessState.UNINITIALIZED;
	ptyProcessReady = Promise.resolve();
	shellProcessId = 0;
	remoteAuthority = undefined;
	os: undefined;
	userHome: undefined;

	private readonly _onProcessReady = this._register(new Emitter<void>());
	public readonly onProcessReady = this._onProcessReady.event;
	private readonly _onBeforeProcessData = this._register(new Emitter<IBeforeProcessDataEvent>());
	public readonly onBeforeProcessData = this._onBeforeProcessData.event;
	private readonly _onProcessData = this._register(new Emitter<string>());
	public readonly onProcessData = this._onProcessData.event;
	private readonly _onProcessTitle = this._register(new Emitter<string>());
	public readonly onProcessTitle = this._onProcessTitle.event;
	private readonly _onProcessExit = this._register(new Emitter<number>());
	public readonly onProcessExit = this._onProcessExit.event;
	private readonly _onProcessOverrideDimensions = this._register(new Emitter<ITerminalDimensions | undefined>());
	public readonly onProcessOverrideDimensions = this._onProcessOverrideDimensions.event;
	private readonly _onProcessResolvedShellLaunchConfig = this._register(new Emitter<IShellLaunchConfig>());
	public readonly onProcessResolvedShellLaunchConfig = this._onProcessResolvedShellLaunchConfig.event;

	async createProcess(
		shellLaunchConfig: IShellLaunchConfig,
		cols: number,
		rows: number,
		isScreenReaderModeEnabled: boolean,
	): Promise<void> {
		this._onProcessReady.fire();
	}

	write(data: string): void {
	}

	setDimensions(cols: number, rows: number): void {
	}

	async getInitialCwd(): Promise<string> {
		return '';
	}

	async getCwd(): Promise<string> {
		return '';
	}

	async getLatency(): Promise<number> {
		return 0;
	}
}
