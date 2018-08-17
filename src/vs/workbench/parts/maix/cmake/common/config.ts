import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions, IConfigurationRegistry } from 'vs/platform/configuration/common/configurationRegistry';
import * as nls from 'vs/nls';

export const CMAKE_PATH_CONFIG_ID = 'cmake.cmakePath';
export const CMAKE_USE_SERVER_CONFIG_ID = 'cmake.useCMakeServer';

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	id: 'cmake',
	order: 20,
	title: 'CMake',
	type: 'object',
	properties: {
		[CMAKE_PATH_CONFIG_ID]: {
			type: 'file',
			description: nls.localize({ comment: ['cmake executable location'], key: CMAKE_PATH_CONFIG_ID }, 'cmake executable location.'),
			default: '',
		},
		[CMAKE_USE_SERVER_CONFIG_ID]: {
			type: 'boolean',
			description: nls.localize({ comment: ['cmake new version'], key: CMAKE_PATH_CONFIG_ID }, 'use new cmake server.'),
			default: true,
		},
	},
});

