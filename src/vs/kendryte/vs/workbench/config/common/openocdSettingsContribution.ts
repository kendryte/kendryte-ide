import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';
import { CONFIG_CATEGORY_DEBUG, CONFIG_KEY_DEBUG_TARGET } from 'vs/kendryte/vs/base/common/configKeys';

registerConfiguration({
	id: 'debugger',
	category: CONFIG_CATEGORY_DEBUG,
	properties: {
		[CONFIG_KEY_DEBUG_TARGET]: {
			title: localize('debugger.target.title', 'OpenOCD target'),
			type: 'string',
			default: '127.0.0.1:3333',
			description: localize('debugger.target.desc', 'Where the OpenOCD device attached?'),
		},
	},
});