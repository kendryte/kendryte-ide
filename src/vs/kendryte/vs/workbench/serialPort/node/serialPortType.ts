import { Duplex } from 'stream';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import SerialPort = require('serialport');

export interface SerialPortBaseBinding extends Duplex {
	__serial_port: never; // prevent type merge
}

export interface ILocalOptions {
	outputCharset?: 'binary' | 'utf8' | 'hex' | 'hexasc';
	inputCharset?: 'latin1' | 'utf8' | 'hex';
	lineEnding?: 'No' | '\\n' | '\\r\\n' | '\\r' | '\\0';
	escape?: boolean;
	echo?: boolean;
	translateLineFeed?: 'No' | '\\n' | '\\r\\n' | '\\r';
	hexLineFeed?: boolean;
}

export const inputCharset: ILocalOptions['inputCharset'][] = ['latin1', 'utf8', 'hex'];
export const outputCharset: ILocalOptions['outputCharset'][] = ['binary', 'utf8', 'hex', 'hexasc'];
export const serialPortYesNoSelection = [true, false];
export const serialPortEOL: Map<ILocalOptions['lineEnding'], string> = new Map();
serialPortEOL.set('No', '');
serialPortEOL.set('\\n', '\n');
serialPortEOL.set('\\r\\n', '\r\n');
serialPortEOL.set('\\r', '\r');
serialPortEOL.set('\\0', '\x00');
export const serialPortEOLArr = Array.from<ILocalOptions['lineEnding']>(serialPortEOL.keys());

export const serialPortLF: Map<ILocalOptions['translateLineFeed'], string> = new Map();
serialPortLF.set('No', '');
serialPortLF.set('\\n', '\n');
serialPortLF.set('\\r\\n', '\r\n');
serialPortLF.set('\\r', '\r');
export const serialPortLFArr = Array.from<ILocalOptions['translateLineFeed']>(serialPortLF.keys());

export const defaultConfig: ILocalOptions & Pick<SerialPort.OpenOptions, 'baudRate' | 'dataBits' | 'stopBits' | 'parity'> = {
	outputCharset: null,
	inputCharset: null,
	lineEnding: '\\n',
	escape: true,
	echo: false,
	translateLineFeed: '\\n',
	hexLineFeed: null,
	baudRate: null,
	dataBits: null,
	stopBits: null,
	parity: null,
};

export interface ISerialPortStatus {
	localOptions?: ILocalOptions;
	instance?: SerialPortBaseBinding;
	openOptions?: SerialPort.OpenOptions;
	openMode?: 'term' | 'raw';
	savedInput?: string;
	hasOpen: boolean;
	portItem: SerialPortItem;
}

export interface SerialLocalStorageSavedData {
	port: Partial<SerialPort.OpenOptions>;
	local: ILocalOptions;
}