import {
	CONFIG_CATEGORY,
	CONFIG_DESCRIPTION_BUILD_VERBOSE,
	CONFIG_DESCRIPTION_DEBUG,
	CONFIG_DESCRIPTION_EXTRA_PATH,
	CONFIG_DESCRIPTION_MAKE_PROGRAM,
	CONFIG_KEY_BUILD_VERBOSE,
	CONFIG_KEY_CMAKE_DEBUG,
	CONFIG_KEY_EXTRA_PATH,
	CONFIG_KEY_MAKE_PROGRAM,
	CONFIG_LABEL_BUILD_VERBOSE,
	CONFIG_LABEL_DEBUG,
	CONFIG_LABEL_EXTRA_PATH,
	CONFIG_LABEL_MAKE_PROGRAM,
} from 'vs/kendryte/vs/base/common/configKeys';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';

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
		[CONFIG_KEY_CMAKE_DEBUG]: {
			title: CONFIG_LABEL_DEBUG,
			type: 'boolean',
			default: false,
			description: CONFIG_DESCRIPTION_DEBUG,
		},
		[CONFIG_KEY_MAKE_PROGRAM]: {
			title: CONFIG_LABEL_MAKE_PROGRAM,
			type: 'string',
			default: 'make',
			description: CONFIG_DESCRIPTION_MAKE_PROGRAM,
		},
		[CONFIG_KEY_EXTRA_PATH]: {
			title: CONFIG_LABEL_EXTRA_PATH,
			type: 'array',
			default: [],
			description: CONFIG_DESCRIPTION_EXTRA_PATH,
		},
	},
});
