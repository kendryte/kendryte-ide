import { SERIAL_PANEL_ID, SerialMonitPanel } from 'vs/workbench/parts/maix/serialPort/electron-browser/panel/panel';
import { TPromise } from 'vs/base/common/winjs.base';
import { IPanel } from 'vs/workbench/common/panel';
import { KEYBINDING_CONTEXT_SERIAL_TERMINAL_FOCUS } from 'vs/workbench/parts/maix/serialPort/electron-browser/serialService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { ISerialPanelService, ISerialPortService } from 'vs/workbench/parts/maix/serialPort/common/type';
import { addStatusBarButtons } from 'vs/workbench/parts/maix/serialPort/electron-browser/buttons';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { SerialMonitorTerminalInstance } from 'vs/workbench/parts/maix/serialPort/electron-browser/panel/terminal';
import { TerminalConfigHelper } from 'vs/workbench/parts/terminal/electron-browser/terminalConfigHelper';

class SerialPanelService implements ISerialPanelService {
	_serviceBrand: any;

	private _instanceList: Map<string, SerialMonitorTerminalInstance> = new Map;
	private _currentDevice: string;
	private _terminalFocusContextKey = KEYBINDING_CONTEXT_SERIAL_TERMINAL_FOCUS.bindTo(this.contextKeyService);
	private _configHelper: TerminalConfigHelper;
	private _outputPanel: SerialMonitPanel;
	private _terminalContainer: HTMLElement;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IPanelService protected panelService: IPanelService,
		@IContextKeyService protected contextKeyService: IContextKeyService,
		@ISerialPortService protected serialPortService: ISerialPortService,
	) {
		panelService.onDidPanelOpen(this.onDidPanelOpen, this);
		panelService.onDidPanelClose(this.onDidPanelClose, this);

		this._configHelper = instantiationService.createInstance(TerminalConfigHelper);

		lifecycleService.when(LifecyclePhase.Running).then(_ => instantiationService.invokeFunction(addStatusBarButtons));
		lifecycleService.onShutdown(() => {
			this._instanceList.forEach((item) => {
				item.dispose();
			});
		});
	}

	private onDidPanelClose(panel: IPanel): void {
		if (this._outputPanel && panel.getId() === SERIAL_PANEL_ID) {
		}
	}

	private onDidPanelOpen(panel: IPanel) {
		if (panel && panel.getId() === SERIAL_PANEL_ID) {
			this._outputPanel = <SerialMonitPanel>this.panelService.getActivePanel();
			if (this._currentDevice && this._instanceList.has(this._currentDevice)) {
				this._outputPanel.setInput(this._instanceList.get(this._currentDevice));
			}
		}
	}

	public hasInstance(dev: string): boolean {
		return this._instanceList.has(dev);
	}

	public setContainers(panelContainer: HTMLElement, terminalContainer: HTMLElement): void {
		this._configHelper.panelContainer = panelContainer;
		this._terminalContainer = terminalContainer;
		this._instanceList.forEach((tab) => tab.attachToElement(this._terminalContainer));
	}

	public async createTerminal(device: string): TPromise<any> {
		if (this._instanceList.has(device)) {
			return this._instanceList.get(device);
		}

		const instance = this.instantiationService.createInstance(
			SerialMonitorTerminalInstance,
			this._terminalFocusContextKey,
			this._configHelper,
			this._terminalContainer,
			{
				name: device,
				executable: device,
			},
		);

		this._initInstanceListeners(instance);

		this._instanceList.set(device, instance);

		return instance;
	}

	private _initInstanceListeners(instance: SerialMonitorTerminalInstance) {
		instance.addDisposable(instance.onDisposed((e: SerialMonitorTerminalInstance) => {
			let found: string;
			this._instanceList.forEach((ee, index) => {
				if (ee === e) {
					found = index;
				}
			});
			if (found) {
				console.log('delete instance: ', found);
				this._instanceList.delete(found);
			}
		}));
		instance.addDisposable(instance.onFocus((e: SerialMonitorTerminalInstance) => {
			this._instanceList.forEach((ee, index) => {
				if (ee === e) {
					console.log('_currentDevice: ', index);
					this._currentDevice = index;
				}
			});
		}));
	}
}

registerSingleton(ISerialPanelService, SerialPanelService);
