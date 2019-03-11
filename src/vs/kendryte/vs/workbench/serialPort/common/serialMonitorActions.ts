import { ACTION_ID_SERIAL_MONITOR_TOGGLE, SERIAL_PANEL_ID } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { TPromise } from 'vs/base/common/winjs.base';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';

class ToggleSerialMonitorAction extends Action {
	public static readonly ID = ACTION_ID_SERIAL_MONITOR_TOGGLE;
	public static readonly LABEL = localize('serialport.togglePanel.title', 'Toggle Serial Monitor');

	constructor(
		id: string = ToggleSerialMonitorAction.ID, label: string = ToggleSerialMonitorAction.LABEL,
		@IPanelService private panelService: IPanelService,
		@IPartService private partService: IPartService,
	) {
		super(id, label, 'octicon octicon-plug');
	}

	async run(): TPromise<void> {
		const currentPanel = this.panelService.getActivePanel();
		if (currentPanel && currentPanel.getId() === SERIAL_PANEL_ID) {
			await this.partService.setPanelHidden(true);
		} else {
			await this.panelService.openPanel(SERIAL_PANEL_ID, true);
		}
	}
}

registerExternalAction(SerialPortActionCategory, ToggleSerialMonitorAction);
