import { ILogService } from 'vs/platform/log/common/log';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { ISerialLaunchConfig, ITerminalProcessManager, ProcessState } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminal';
import { ISerialPortService } from 'vs/workbench/parts/maix/serialPort/common/type';
import SerialPort = require('serialport');

export class SerialManager extends Disposable implements ITerminalProcessManager {
	processState: ProcessState = ProcessState.UNINITIALIZED;
	ptyProcessReady: TPromise<void>;
	shellProcessId: number = -1;
	initialCwd: string;

	private _serialDevicePath: string;
	private _port: SerialPort;
	private _preLaunchInputQueue: string[] = [];

	private readonly _onProcessReady: Emitter<void> = new Emitter<void>();
	public get onProcessReady(): Event<void> { return this._onProcessReady.event; }

	private readonly _onProcessData: Emitter<string> = new Emitter<string>();
	public get onProcessData(): Event<string> { return this._onProcessData.event; }

	private readonly _onProcessTitle: Emitter<string> = new Emitter<string>();
	public get onProcessTitle(): Event<string> { return this._onProcessTitle.event; }

	private readonly _onProcessExit: Emitter<number> = new Emitter<number>();
	public get onProcessExit(): Event<number> { return this._onProcessExit.event; }

	constructor(
		@ILogService private readonly _logService: ILogService,
		@ISerialPortService protected serialPortService: ISerialPortService,
	) {
		super();
		this.ptyProcessReady = new TPromise<void>(c => {
			this.onProcessReady(() => {
				this._logService.debug(`Terminal process ready (serial device: ${this._serialDevicePath})`);
				c(void 0);
			});
		});
		this._onProcessReady.fire();
	}

	public addDisposable(disposable: IDisposable) {
		this._toDispose.push(disposable);
	}

	public createProcess(shellLaunchConfig: ISerialLaunchConfig, cols: number, rows: number) {
		this.processState = ProcessState.LAUNCHING;

		const portP = this.serialPortService.openPort(shellLaunchConfig.serialDevice, shellLaunchConfig.options);

		portP.then((port: SerialPort) => {
			this._port = port;

			port.on('end', () => {
				if (this.processState !== ProcessState.LAUNCHING) {
					this.processState = ProcessState.KILLED_BY_PROCESS;
				}
				this._onProcessExit.fire(0);
			});

			port.on('data', (d) => {
				this._onProcessData.fire(d.toString());
			});

			this.initPort();
		}, (error: Error) => {
			this._onProcessData.fire('\nError: ' + error.stack);
			this.processState = ProcessState.KILLED_DURING_LAUNCH;
			this._onProcessExit.fire(1);
		});
	}

	private initPort() {
		const port = this._port;
		port.get((error: Error, status: any) => {
			if (error) {
				this._onProcessData.fire('\nError: ' + error.stack);
				this.processState = ProcessState.KILLED_DURING_LAUNCH;
				this._onProcessExit.fire(1);
				return;
			}

			console.log('[serial port] ', status);
			this._onProcessReady.fire();

			// Send any queued data that's waiting
			if (this._preLaunchInputQueue.length > 0) {
				port.write(this._preLaunchInputQueue.join(''));
				this._preLaunchInputQueue.length = 0;
			}

			this.processState = ProcessState.RUNNING;
		});
	}

	public write(data: string): void {
		if (this._port) {
			// Send data if the pty is ready
			this._port.write(data);
		} else {
			// If the pty is not ready, queue the data received to send later
			this._preLaunchInputQueue.push(data);
		}
	}

	public setDimensions(cols: number, rows: number): void {
		// serial port has no dimension
	}

	public dispose(): void {
		if (this._port) {
			// If the process was still connected this dispose came from
			// within VS Code, not the process, so mark the process as
			// killed by the user.
			this.processState = ProcessState.KILLED_BY_USER;
			this._port.close();
			this._port = null;
		}
		super.dispose();
	}
}
