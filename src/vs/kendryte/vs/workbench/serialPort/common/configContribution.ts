import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';
import { CONFIG_CATEGORY, CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE, CONFIG_KEY_FLASH_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { flashBaudRate, standardBaudRate } from 'vs/kendryte/vs/workbench/config/common/baudrate';

export function kendryteConfigRegisterSerialPort() {
	registerConfiguration({
		id: 'serialport',
		category: CONFIG_CATEGORY.DEPLOY.id,
		overridable: true,
		properties: {
			[CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE]: {
				title: localize('serialport.baudrate.monitor', 'Monitor Baudrate'),
				type: 'string',
				enum: standardBaudRate.map(e => e.toString()),
				default: '115200',
				description: localize('serialport.baudrate.monitor.desc', 'Default baudrate to use when connect to new serial port.'),
			},
			[CONFIG_KEY_FLASH_SERIAL_BAUDRATE]: {
				title: localize('serialport.baudrate.flash', 'Flash Baudrate'),
				type: 'string',
				enum: flashBaudRate.map(e => e.toString()),
				default: '2000000',
				description: localize('serialport.baudrate.flash.desc', 'Flasher baudrate.'),
			},
		},
	});
}
