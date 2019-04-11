import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY } from 'vs/kendryte/vs/base/common/configKeys';
import { CONFIG_DESCRIPTION_SOURCE_TYPES, CONFIG_KEY_SOURCE_TYPES, CONFIG_TITLE_SOURCE_TYPES } from 'vs/kendryte/vs/platform/fileDialog/common/configKeys';

registerConfiguration({
	id: 'openDialog',
	category: CONFIG_CATEGORY.BUILD.id,
	overridable: true,
	properties: {
		[CONFIG_KEY_SOURCE_TYPES]: {
			title: CONFIG_TITLE_SOURCE_TYPES,
			type: 'string',
			default: 'c;cpp',
			description: CONFIG_DESCRIPTION_SOURCE_TYPES,
		},
	},
});
