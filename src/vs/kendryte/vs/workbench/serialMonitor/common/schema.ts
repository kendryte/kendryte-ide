import { OpenOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';
import { localize } from 'vs/nls';
import { IJSONSchemaMapOf } from 'vs/kendryte/vs/base/common/jsonSchemaHelper/type';
import { ILocalOptions } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { standardBaudRate, standardDataBits, standardParity, standardStopBits } from 'vs/kendryte/vs/services/serialPort/common/standard';
import { objectKeys } from 'vs/kendryte/vs/base/common/type/objectKeys';

export type ILimitedOpenOptions = Pick<OpenOptions, 'baudRate' | 'dataBits' | 'stopBits' | 'parity'>;
export type ISerialMonitorSettings = ILimitedOpenOptions & ILocalOptions;

export function allSerialPortDefaults(): ISerialMonitorSettings {
	const ret: any = {};
	objectKeys(localOptionsScheme).forEach((key) => {
		ret[key] = localOptionsScheme[key].default;
	});
	return ret;
}

export function typedValues<T extends Partial<ISerialMonitorSettings>>(settings: T): T {
	objectKeys(settings).forEach((key) => {
		const def = (localOptionsScheme as any)[key];
		if (def) {
			if (def.type === 'number') {
				settings[key] = parseFloat(settings[key] as any) as any;
			} else if (def.type === 'number') {
				settings[key] = !!(settings[key] as any) as any;
			}
		}
	});
	return settings;
}

export const localOptionsScheme: IJSONSchemaMapOf<ISerialMonitorSettings> = {
	baudRate: {
		title: localize('baudrate.title', 'Baud Rate'),
		description: localize('baudrate.desc', 'Serial port baud rate'),
		type: 'number',
		enum: standardBaudRate,
		default: 115200,
		$comment: 'editable,undefined',
	},
	dataBits: {
		title: localize('dataBits.title', 'Data Bits'),
		description: localize('dataBits.desc', 'Serial port data bits'),
		type: 'number',
		enum: standardDataBits,
		default: 8,
		$comment: 'undefined',
	},
	stopBits: {
		title: localize('stopBits.title', 'Stop Bits'),
		description: localize('stopBits.desc', 'Serial port stop bits'),
		type: 'number',
		enum: standardStopBits,
		default: 1,
		$comment: 'undefined',
	},
	parity: {
		title: localize('parity.title', 'Parity'),
		description: localize('parity.desc', 'Serial port parity'),
		type: 'number',
		enum: standardParity,
		default: 'none',
		$comment: 'undefined',
	},
	outputCharset: {
		title: localize('outputCharset.title', 'Output Charset'),
		description: localize('outputCharset.desc', 'Transform device output before print out'),
		type: 'string',
		enum: ['binary', 'utf8', 'hex', 'hexasc'],
		enumDescriptions: [
			localize('charset.binary', 'binary: Device output is ANSI'),
			localize('charset.utf8', 'utf8: Device output is UTF-8'),
			localize('charset.hex', 'hex: Device output is binary, print as HEX'),
			localize('charset.hexasc', 'hexasc: Device output is HEX string, transform to ANSI'),
		],
		default: 'binary',
	},
	inputCharset: {
		title: localize('inputCharset.title', 'Input Charset'),
		description: localize('inputCharset.desc', 'Transform your input before send to device'),
		type: 'string',
		enum: ['latin1', 'utf8', 'hex'],
		default: 'latin1',
	},
	lineEnding: {
		title: localize('lineEnding.title', 'Input Line Ending'),
		description: localize('lineEnding.desc', '(Raw mode only) Append character after your input'),
		type: 'string',
		enum: ['', '\n', '\r\n', '\r', '\x00'],
		enumDescriptions: ['No', '\\n', '\\r\\n', '\\r', '\\0'],
		default: '\n',
	},
	escape: {
		title: localize('escape.title', 'Escape'),
		description: localize('escape.desc', '(Raw mode only) Enable input escape, eg: "\\n" will transform to 0x0A'),
		type: 'boolean',
		default: true,
	},
	echo: {
		title: localize('echo.title', 'Echo'),
		description: localize('echo.desc', 'Echo back what you type'),
		type: 'boolean',
		default: false,
	},
	translateLineFeed: {
		title: localize('translateLineFeed.title', 'Translate Output LF'),
		description: localize('translateLineFeed.desc', 'When receive these character(s), print a new line'),
		type: 'string',
		enum: ['', '\n', '\r\n', '\r'],
		enumDescriptions: ['No', '\\n', '\\r\\n', '\\r'],
		default: '\n',
	},
	hexLineFeed: {
		title: localize('hexLineFeed.title', 'Hex Mode Use LF'),
		description: localize('hexLineFeed.desc', '(When charset=hex) Do not dump \\n character'),
		type: 'boolean',
		default: false,
	},
};
