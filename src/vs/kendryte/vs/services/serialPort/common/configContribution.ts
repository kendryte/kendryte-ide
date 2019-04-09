import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY, CONFIG_DESCRIPTION_FILTER_EMPTY_DEVICES, CONFIG_KEY_FILTER_EMPTY_DEVICES } from 'vs/kendryte/vs/base/common/configKeys';
import { localize } from 'vs/nls';

registerConfiguration({
	id: 'serialport',
	category: CONFIG_CATEGORY.KENDRYTE.id,
	overridable: true,
	properties: {
		[CONFIG_KEY_FILTER_EMPTY_DEVICES]: {
			title: localize('serialport.config.filter-empty', 'Filter Empty Devices'),
			type: 'boolean',
			default: true,
			description: CONFIG_DESCRIPTION_FILTER_EMPTY_DEVICES,
		},
	},
});
