import { CONFIG_CATEGORY, CONFIG_DESCRIPTION_CUSTOM, CONFIG_KEY_CUSTOM } from 'vs/kendryte/vs/base/common/configKeys';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';

registerConfiguration({
	id: 'custom',
	category: CONFIG_CATEGORY.DEBUG_CUSTOM.id,
	properties: {
		[CONFIG_KEY_CUSTOM]: {
			description: CONFIG_DESCRIPTION_CUSTOM,
			type: 'string',
			default: '',
		},
	},
});

export function createCustomConfig(port: number, content: string) {
	return `${content}
gdb_port ${port}
tcl_port ${port + 1}
telnet_port ${port + 2}
`;
}