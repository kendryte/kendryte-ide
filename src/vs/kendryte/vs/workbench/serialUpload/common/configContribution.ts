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
			enum: [115200, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000],
			enumDescriptions: ['115200', '1M', '2M', '3M (Max for KD233)', '4M', '5M', '6M', '7M', '8M', '9M', '10M'],
			default: 115200,
			description: localize('serialport.baudrate.flash.desc', 'Flasher baudrate.'),
		},
	},
});
