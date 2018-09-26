import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { MAIX_CONFIG_KEY_DEBUG, MAIX_CONFIG_KEY_SERIAL_BAUDRATE } from 'kendryte/vs/platform/common/type';

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
			enum: [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000].map(e => e.toString()),
			default: '115200',
			description: localize('flash.device.id.desc', 'OpenOCD host or IP address.(No effect when target is localhost)'),
		},
	},
});