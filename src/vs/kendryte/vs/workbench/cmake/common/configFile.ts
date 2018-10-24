import { localize } from 'vs/nls';
import { CONFIG_CATEGORY_BUILD, CONFIG_KEY_BUILD_VERBOSE } from 'vs/kendryte/vs/base/common/configKeys';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';

export function registerCMakeConfig() {
	registerConfiguration({
		id: 'build',
		category: CONFIG_CATEGORY_BUILD,
		properties: {
			[CONFIG_KEY_BUILD_VERBOSE]: {
				title: localize('config.cmake.build.title', 'Verbose Build'),
				type: 'boolean',
				default: false,
				description: localize('config.cmake.build.desc', 'Verbose log when run build.'),
			},
		},
	});
}