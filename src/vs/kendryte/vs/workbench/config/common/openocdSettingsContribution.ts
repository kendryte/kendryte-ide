import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { MAIX_CONFIG_KEY_DEBUG, MAIX_CONFIG_KEY_SERIAL_BAUDRATE } from 'vs/kendryte/vs/platform/common/type';
import { standardBaudRate } from 'vs/kendryte/vs/workbench/config/common/baudrate';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'debugger',
	properties: {
		[MAIX_CONFIG_KEY_DEBUG]: {
			title: localize('debugger.target.title', 'OpenOCD target'),
			type: 'string',
			default: '127.0.0.1:3333',
			description: localize('debugger.target.desc', 'Where the OpenOCD device attached?'),
		},
		[MAIX_CONFIG_KEY_SERIAL_BAUDRATE]: {
			title: localize('baudrate', 'Baudrate'),
			type: 'string',
			enum: standardBaudRate.map(e => e.toString()),
			default: '115200',
			description: localize('flash.device.id.desc', 'OpenOCD host or IP address.(No effect when target is localhost)'),
		},
	},
});