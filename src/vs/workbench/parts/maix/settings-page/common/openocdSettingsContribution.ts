import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'debugger',
	properties: {
		'debugger.target': {
			title: localize('debugger.target.title', 'OpenOCD target'),
			type: 'string',
			enum: ['remote', 'localhost'],
			enumDescriptions: [
				localize('debugger.localhost', 'Connect a device to your computer.'),
				localize('debugger.remove', 'Debug a device on network.')
			],
			default: 'localhost',
			description: localize('debugger.target.desc', 'Where the OpenOCD device attached?'),
		},
		'debugger.targetIp': {
			title: localize('debugger.targetIp.title', 'OpenOCD IP address'),
			type: 'string',
			default: '127.0.0.1',
			description: localize('debugger.targetIp.desc', 'OpenOCD host or IP address.(No effect when target is localhost)'),
		},
		'debugger.port.core0': {
			title: localize('debugger.port.core.title', 'Core {0} port', 0),
			type: 'number',
			default: '3333',
			description: localize('debugger.port.core.desc', 'OpenOCD port for core {0}', 0),
		},
		'debugger.port.core1': {
			title: localize('debugger.port.core.title', 'Core {0} port', 1),
			type: 'number',
			default: '3334',
			description: localize('debugger.port.core.desc', 'OpenOCD port for core {0}', 1),
		},
	}
});