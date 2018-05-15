import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import { localize } from 'vs/nls';

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	'id': 'workbench',
	'title': localize('maixConfigurationTitle', 'Maix'),
	'type': 'object',
	'properties': {
		'workbench.maix.wowSuchDoge': {
			'type': 'string',
			'default': 'Hello Config',
			'description': localize('workbench.maix.test', 'blabla...')
		},
	}
});