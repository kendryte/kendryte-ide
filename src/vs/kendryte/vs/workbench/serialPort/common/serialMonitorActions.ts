import { ACTION_ID_SERIAL_MONITOR_TOGGLE, SERIAL_PANEL_ID } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';

class ToggleSerialMonitorAction extends Action {
	public static readonly ID = ACTION_ID_SERIAL_MONITOR_TOGGLE;
	public static readonly LABEL = localize('serialport.togglePanel.title', 'Toggle Serial Monitor');

	constructor(
		id: string = ToggleSerialMonitorAction.ID, label: string = ToggleSerialMonitorAction.LABEL,
		@IPanelService private panelService: IPanelService,
		@IWorkbenchLayoutService private layoutService: IWorkbenchLayoutService,
	) {
		super(id, label, 'octicon octicon-plug');
	}

	async run(): Promise<void> {
		const currentPanel = this.panelService.getActivePanel();
		if (currentPanel && currentPanel.getId() === SERIAL_PANEL_ID) {
			await this.layoutService.setPanelHidden(true);
		} else {
			await this.panelService.openPanel(SERIAL_PANEL_ID, true);
		}
	}
}

registerExternalAction(SerialPortActionCategory, ToggleSerialMonitorAction);
