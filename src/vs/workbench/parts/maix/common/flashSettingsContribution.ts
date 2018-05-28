import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'flash',
	properties: {
		'flash.baudrate': {
			title: localize('flash.baudrate', 'Baudrate'),
			type: 'string',
			enum: [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200, 128000, 256000].map(e => e.toString()),
			default: '115200',
			description: localize('flash.device.id.desc', 'OpenOCD host or IP address.(No effect when target is localhost)'),
		},
		'flash.weight': {
			title: localize('flash.weight.title', 'Flash weights'),
			type: 'boolean',
			default: false,
			description: localize('flash.weight.desc', 'Flash weights?'),
		},
		'flash.weightPath': {
			title: localize('flash.weightPath.title', 'Weight file location'),
			type: 'file',
			default: '',
			description: localize('flash.weightPath.desc', 'Select a weight file.'),
		},
	}
});
