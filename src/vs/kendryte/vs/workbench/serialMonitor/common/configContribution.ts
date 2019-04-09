import { localize } from 'vs/nls';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import { CONFIG_CATEGORY, CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { standardBaudRate } from 'vs/kendryte/vs/services/serialPort/common/standard';

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
	},
});
