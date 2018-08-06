import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';
import { dynamicEnum } from 'vs/workbench/parts/maix/_library/common/type';
import { Registry } from 'vs/platform/registry/common/platform';
import { CONFIG_KEY_SRIAL_PORT, ISerialPortService } from 'vs/workbench/parts/maix/serialPort/common/type';
import { ReloadSerialPortDevicesAction } from 'vs/workbench/parts/maix/serialPort/common/reloadAction';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'serialport',
	overridable: true,
	properties: {
		[CONFIG_KEY_SRIAL_PORT]: {
			title: localize('serialport.device.title', 'UART Device'),
			type: 'string',
			enumDescriptions: dynamicEnum(ISerialPortService, true),
			description: localize('serialport.device.desc', 'Select Device'),
			overridable: true,
		} as any,
		'serialport.reloadDevice': {
			title: localize('serialport.reloadDevice.title', 'Reload device list'),
			type: 'button',
			description: localize('serialport.reloadDevice.desc', 'Reload device list'),
			overridable: false,
			default: ReloadSerialPortDevicesAction.ID,
		},
	},
});
