import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindow';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { TPromise } from 'vs/base/common/winjs.base';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { SERIAL_PANEL_ID } from 'vs/kendryte/vs/workbench/serialPort/common/type';

export interface ISerialMonitorControlService {
	_serviceBrand: any;

	copySelection();

	paste();

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
			this.xterm.focusFindWidget();
		});
	}

	private ensure(): TPromise<void> {
		if (this.xterm) {
			return TPromise.as(void 0);
		}
		return this.panelService.openPanel(SERIAL_PANEL_ID).then(e => void 0).then(undefined, (e) => {
			this.notificationService.error(e);
		});
	}
}

registerSingleton(ISerialMonitorControlService, SerialMonitorControlService);
