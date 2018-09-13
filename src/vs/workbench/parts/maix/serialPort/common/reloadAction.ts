import { INotificationService } from 'vs/platform/notification/common/notification';
import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { ISerialPortService, SerialPortActionCategory } from 'vs/workbench/parts/maix/serialPort/common/type';
import BaseSeverity from 'vs/base/common/severity';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { KeyCode, KeyMod } from 'vs/base/common/keyCodes';
import { Registry } from 'vs/platform/registry/common/platform';

export class ReloadSerialPortDevicesAction extends Action {
	public static readonly ID = 'ReloadSerialPortDevicesAction';
	public static readonly LABEL = localize('serialport.reloadDevice.title', 'Reload device list');

	constructor(
		id: string,
		label: string,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label, 'terminal-action octicon octicon-repo-sync');
	}

	public async run(event?: any): TPromise<string[]> {
		await this.serialPortService.refreshDevices();
		const devices = await this.serialPortService.getValues();
		this.notificationService.notify({
			severity: BaseSeverity.Info,
			message: `Serial device rescan complete. (${devices.length} devices)`,
		});
		return devices;
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
        .registerWorkbenchAction(
	        new SyncActionDescriptor(
		        ReloadSerialPortDevicesAction,
		        ReloadSerialPortDevicesAction.ID,
		        ReloadSerialPortDevicesAction.LABEL,
		        { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_COMMA },
	        ),
	        'Serial: Reload device lists',
	        SerialPortActionCategory,
        );

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: ReloadSerialPortDevicesAction.ID,
		title: `${SerialPortActionCategory}: ${ReloadSerialPortDevicesAction.LABEL}`,
	},
});
