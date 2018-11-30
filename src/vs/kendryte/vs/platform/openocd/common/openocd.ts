import {
	CONFIG_CATEGORY,
	CONFIG_DESCRIPTION_OPENOCD_CORE,
	CONFIG_DESCRIPTION_OPENOCD_PORT,
	CONFIG_DESCRIPTION_OPENOCD_USE,
	CONFIG_KEY_OPENOCD_CORE,
	CONFIG_KEY_OPENOCD_PORT,
	CONFIG_KEY_OPENOCD_USE,
} from 'vs/kendryte/vs/base/common/configKeys';
import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';

export const ConfigOpenOCDTypes = {
	jtag: 'JTag',
	ftdi: 'FTDI',
	custom: localize('custom', 'Custom'),
};

export function kendryteConfigRegisterOpenOCD() {
	registerConfiguration({
		id: 'openocd',
		category: CONFIG_CATEGORY.OPENOCD.id,
		properties: {
			[CONFIG_KEY_OPENOCD_USE]: {
				description: CONFIG_DESCRIPTION_OPENOCD_USE,
				type: 'string',
				enum: Object.values(ConfigOpenOCDTypes),
				default: ConfigOpenOCDTypes.jtag,
				enumDescriptions: [
					localize('openocd.use.jtag', 'use JTag interface'),
					localize('openocd.use.ftdi', 'use FTDI interface'),
					localize('openocd.use.custom', 'do not use bundled config file, write your own at "{0}" below', CONFIG_CATEGORY.DEBUG_CUSTOM.category),
				],
			},
			[CONFIG_KEY_OPENOCD_PORT]: {
				description: CONFIG_DESCRIPTION_OPENOCD_PORT,
				type: 'number',
				default: 0,
				minimum: 0,
				maximum: 65535,
			},
			[CONFIG_KEY_OPENOCD_CORE]: {
				description: CONFIG_DESCRIPTION_OPENOCD_CORE,
				type: 'number',
				default: -1,
				minimum: -1,
				maximum: 1,
			},
		},
	});
}
