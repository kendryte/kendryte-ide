import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { MAIX_CONFIG_KEY_DEBUG } from 'vs/workbench/parts/maix/_library/common/type';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'debugger',
	properties: {
		[MAIX_CONFIG_KEY_DEBUG]: {
			title: localize('debugger.target.title', 'OpenOCD target'),
			type: 'string',
			default: '127.0.0.1:3333',
			description: localize('debugger.target.desc', 'Where the OpenOCD device attached?'),
		},
	},
});