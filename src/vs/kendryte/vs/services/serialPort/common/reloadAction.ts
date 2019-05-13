import { INotificationService } from 'vs/platform/notification/common/notification';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { ACTION_ID_REFRESH_SERIAL_DEVICE } from 'vs/kendryte/vs/services/serialPort/common/actionId';
import BaseSeverity from 'vs/base/common/severity';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_SERIAL_PORT } from 'vs/kendryte/vs/base/common/menu/serialPort';

class ReloadSerialPortDevicesAction extends Action {
	public static readonly ID = ACTION_ID_REFRESH_SERIAL_DEVICE;
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
		const devices = await this.serialPortService.getDynamicEnum();
		this.notificationService.notify({
			severity: BaseSeverity.Info,
			message: `Serial device rescan complete. (${devices.length} devices)`,
		});
		return devices.map(entry => entry.comName);
	}
}

registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, ReloadSerialPortDevicesAction);
