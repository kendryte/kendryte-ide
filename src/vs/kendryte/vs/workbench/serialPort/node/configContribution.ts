import { localize } from 'vs/nls';
import { SERIAL_MONITOR_ACTION_REFRESH_DEVICE } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';
import { CONFIG_CATEGORY_DEPLOY, CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE, CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { standardBaudRate } from 'vs/kendryte/vs/workbench/config/common/baudrate';

registerConfiguration({
	id: 'serialport',
	category: CONFIG_CATEGORY_DEPLOY,
	overridable: true,
	properties: {
		[CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE]: {
			title: localize('serialport.baudrate.monitor', 'Monitor Baudrate'),
			type: 'string',
			enum: standardBaudRate.map(e => e.toString()),
			default: '115200',
			description: localize('flash.device.id.desc', 'Default baudrate to use when connect to new serial port.'),
		},
		[CONFIG_KEY_FLASH_SERIAL_BAUDRATE]: {
			title: localize('serialport.baudrate.flash', 'Flash Baudrate'),
			type: 'string',
			enum: standardBaudRate.map(e => e.toString()),
			default: '115200',
			description: localize('flash.device.id.desc', 'Default baudrate when flashing program.'),
		},
		'serialport.reloadDevice': {
			title: localize('serialport.reloadDevice.title', 'Reload device list'),
			type: 'button',
			description: localize('serialport.reloadDevice.desc', 'Reload device list'),
			overridable: false,
			default: SERIAL_MONITOR_ACTION_REFRESH_DEVICE,
		},
	},
});
