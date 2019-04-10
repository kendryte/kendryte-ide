import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY, CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';

registerConfiguration({
	id: 'serialport',
	category: CONFIG_CATEGORY.DEPLOY.id,
	overridable: true,
	properties: {
		[CONFIG_KEY_FLASH_SERIAL_BAUDRATE]: {
			title: localize('serialport.baudrate.flash', 'Flash Baudrate'),
			type: 'number',
			enum: [115200, 140000, 256000, 1000000, 2000000, 3000000, 4000000],
			enumDescriptions: ['115200', '115211', '256000', '1M', '2M', '3M', '4M'],
			default: 115200,
			description: localize('serialport.baudrate.flash.desc', 'Flasher baudrate.'),
		},
	},
});
