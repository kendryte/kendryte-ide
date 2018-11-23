import { CONFIG_CATEGORY, CONFIG_DESCRIPTION_BUILD_VERBOSE, CONFIG_KEY_BUILD_VERBOSE, CONFIG_LABEL_BUILD_VERBOSE, } from 'vs/kendryte/vs/base/common/configKeys';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';

export function registerCMakeConfig() {
	registerConfiguration({
		id: 'build',
		category: CONFIG_CATEGORY.BUILD.id,
		properties: {
			[CONFIG_KEY_BUILD_VERBOSE]: {
				title: CONFIG_LABEL_BUILD_VERBOSE,
				type: 'boolean',
				default: false,
				description: CONFIG_DESCRIPTION_BUILD_VERBOSE,
			},
		},
	});
}