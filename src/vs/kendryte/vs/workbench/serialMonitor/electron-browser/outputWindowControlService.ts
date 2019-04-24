import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindow';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { SERIAL_PANEL_ID } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';

export interface ISerialMonitorControlService {
	_serviceBrand: any;

	copySelection(): void;

	paste(): void;

	clearScreen(): void;

	focusFindWidget(): void;

	setSingleton(term: OutputXTerminal): void;
}

export const ISerialMonitorControlService = createDecorator<ISerialMonitorControlService>('serialMonitorControlService');

class SerialMonitorControlService implements ISerialMonitorControlService {
	_serviceBrand: any;
	private xterm: OutputXTerminal;

	constructor(
		@IPanelService private readonly panelService: IPanelService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
	}

	public setSingleton(term: OutputXTerminal): void {
		this.xterm = term;
	}

	copySelection() {
		this.ensure().then(() => {
			this.xterm.copySelection();
		});
	}

	paste() {
		this.ensure().then(() => {
			this.xterm.paste();
		});
	}

	clearScreen(): void {
		this.ensure().then(() => {
			this.xterm.clearScreen();
		});
	}

	focusFindWidget() {
		this.ensure().then(() => {
			return this.xterm.focusFindWidget();
		});
	}

	private async ensure(): Promise<void> {
		if (this.xterm) {
			return Promise.resolve(void 0);
		}
		try {
			this.panelService.openPanel(SERIAL_PANEL_ID);
		} catch (e) {
			this.notificationService.error(e);
		}
	}
}

registerSingleton(ISerialMonitorControlService, SerialMonitorControlService);
