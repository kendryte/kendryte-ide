import { TPromise } from 'vs/base/common/winjs.base';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { CONFIG_KEY_DEFAULT_DEVICE, ISerialPanelService, SerialPortActionCategory, SerialPortActionId } from 'vs/workbench/parts/maix/serialPort/common/type';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { KeyCode } from 'vs/base/common/keyCodes';
import { Registry } from 'vs/platform/registry/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';

class ToggleMonitorAction extends Action {
	public static readonly ID = SerialPortActionId;
	public static readonly LABEL = localize('serialport.monitor.start', 'Start serial monitor');

	constructor(
		id: string,
		label: string,
		@ISerialPanelService private serialPortService: ISerialPanelService,
		@IConfigurationService private configurationService: IConfigurationService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	public async run(event?: any): TPromise<void> {
		const dev = this.configurationService.getValue(CONFIG_KEY_DEFAULT_DEVICE) as string;
		if (!dev) {
			this.notificationService.error('Not configure any serial device, please select one.');
		}
		this.serialPortService.createTerminal(dev);
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(
		new SyncActionDescriptor(
			ToggleMonitorAction,
			ToggleMonitorAction.ID,
			ToggleMonitorAction.LABEL,
			{ primary: KeyCode.F12 },
		),
		'Serial: Start serial monitor',
		SerialPortActionCategory,
);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: ToggleMonitorAction.ID,
		title: `${SerialPortActionCategory}: ${ToggleMonitorAction.LABEL}`,
	},
});
