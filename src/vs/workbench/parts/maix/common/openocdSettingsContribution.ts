import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'openocd',
	properties: {
		'openocd.target': {
			title: localize('openocd.target.title', 'OpenOCD target'),
			type: 'string',
			enum: ['remote', 'localhost'],
			enumDescriptions: [
				localize('openocd.localhost', 'Connect a device to your computer.'),
				localize('openocd.remove', 'Debug a device on network.')
			],
			default: 'localhost',
			description: localize('openocd.target.desc', 'Where the OpenOCD device attached?'),
		},
		'openocd.targetIp': {
			title: localize('openocd.targetIp.title', 'OpenOCD IP address'),
			type: 'string',
			default: '127.0.0.1',
			description: localize('openocd.targetIp.desc', 'OpenOCD host or IP address.(No effect when target is localhost)'),
		},
		'openocd.port.core0': {
			title: localize('openocd.port.core.title', 'Core {0} port', 0),
			type: 'number',
			default: '',
			description: localize('openocd.port.core.desc', 'OpenOCD port for core {0}', 0),
		},
		'openocd.port.core1': {
			title: localize('openocd.port.core.title', 'Core {0} port', 1),
			type: 'number',
			default: '',
			description: localize('openocd.port.core.desc', 'OpenOCD port for core {0}', 1),
		},
	}
});