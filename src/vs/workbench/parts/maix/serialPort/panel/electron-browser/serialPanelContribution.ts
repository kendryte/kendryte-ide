import { ISerialPanelService } from 'vs/workbench/parts/maix/serialPort/common/type';
import { SERIAL_PANEL_ID, SerialMonitPanel } from 'vs/workbench/parts/maix/serialPort/panel/electron-browser/panel';
import { IPanel } from 'vs/workbench/common/panel';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { addStatusBarButtons } from 'vs/workbench/parts/maix/serialPort/electron-browser/buttons';
import { ISerialPortService } from 'vs/workbench/parts/maix/serialPort/node/serialPortService';

class SerialPanelService implements ISerialPanelService {
	_serviceBrand: any;

	private creationPanel: SerialMonitPanel;

	constructor(
		@IInstantiationService protected instantiationService: IInstantiationService,
		@ILifecycleService lifecycleService: ILifecycleService,
		@IPanelService protected panelService: IPanelService,
		@IContextKeyService protected contextKeyService: IContextKeyService,
		@ISerialPortService protected serialPortService: ISerialPortService,
	) {
		panelService.onDidPanelOpen(this.onDidPanelOpen, this);
		panelService.onDidPanelClose(this.onDidPanelClose, this);

		lifecycleService.when(LifecyclePhase.Running).then(_ => instantiationService.invokeFunction(addStatusBarButtons));
		lifecycleService.onShutdown(() => {
			if (this.creationPanel) {
				this.creationPanel.dispose();
			}
		});
	}

	private onDidPanelClose(panel: IPanel): void {
		if (this.creationPanel && panel.getId() === SERIAL_PANEL_ID) {
		}
	}

	private onDidPanelOpen(panel: IPanel) {
		if (panel && panel.getId() === SERIAL_PANEL_ID) {
			this.creationPanel = <SerialMonitPanel>this.panelService.getActivePanel();
		}
	}

	public showConfigPanel(): void {
	}
}

registerSingleton(ISerialPanelService, SerialPanelService);
