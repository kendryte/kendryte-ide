import { TerminalInstance } from 'vs/workbench/parts/terminal/electron-browser/terminalInstance';
import { SerialManager } from 'vs/workbench/parts/maix/serialPort/electron-browser/panel/serialManager';

export class SerialMonitorTerminalInstance extends TerminalInstance {
	protected _createProcess(): void {
		this._processManager = this._instantiationService.createInstance(SerialManager);
		this._processManager.onProcessReady(() => this._onProcessIdReady.fire(this));
		this._processManager.onProcessExit(exitCode => this._onProcessExit(exitCode));
		this._processManager.createProcess(this._shellLaunchConfig, this._cols, this._rows);

		this._processManager.onProcessData(data => this._onData.fire(data));

		if (this._shellLaunchConfig.name) {
			this.setTitle(this._shellLaunchConfig.name, false);
		} else {
			// Only listen for process title changes when a name is not provided
			this.setTitle(this._shellLaunchConfig.executable, true);
			this._messageTitleDisposable = this._processManager.onProcessTitle(title => this.setTitle(title ? title : '', true));
		}
	}
}