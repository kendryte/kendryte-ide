import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';
import { dynamicEnum } from 'vs/kendryte/vs/platform/common/type';
import { Registry } from 'vs/platform/registry/common/platform';
import { CONFIG_KEY_SRIAL_PORT, SERIAL_MONITOR_ACTION_REFRESH_DEVICE } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';

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
			default: SERIAL_MONITOR_ACTION_REFRESH_DEVICE,
		},
	},
});
