import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY, CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';

const flashBaudRate = [
	115200, 256000, 2000000, 2560000,
];

registerConfiguration({
	id: 'serialport',
	category: CONFIG_CATEGORY.DEPLOY.id,
	overridable: true,
	properties: {
		[CONFIG_KEY_FLASH_SERIAL_BAUDRATE]: {
			title: localize('serialport.baudrate.flash', 'Flash Baudrate'),
			type: 'number',
			enum: flashBaudRate.map(e => e.toString()),
			default: 2000000,
			description: localize('serialport.baudrate.flash.desc', 'Flasher baudrate.'),
		},
	},
});
