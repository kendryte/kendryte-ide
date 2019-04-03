import { INotificationService } from 'vs/platform/notification/common/notification';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { SERIAL_MONITOR_ACTION_REFRESH_DEVICE } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import BaseSeverity from 'vs/base/common/severity';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';

class ReloadSerialPortDevicesAction extends Action {
	public static readonly ID = SERIAL_MONITOR_ACTION_REFRESH_DEVICE;
	public static readonly LABEL = localize('serialport.reloadDevice.title', 'Reload device list');

	constructor(
		id: string,
		label: string,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label, 'terminal-action octicon octicon-repo-sync');
	}

	public async run(event?: any): Promise<string[]> {
		await this.serialPortService.refreshDevices();
		const devices = await this.serialPortService.getValues();
		this.notificationService.notify({
			severity: BaseSeverity.Info,
			message: `Serial device rescan complete. (${devices.length} devices)`,
		});
		return devices.map(entry => entry.comName);
	}
}

registerExternalAction(SerialPortActionCategory, ReloadSerialPortDevicesAction);
