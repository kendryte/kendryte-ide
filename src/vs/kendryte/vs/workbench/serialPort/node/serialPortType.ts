import { Duplex } from 'stream';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import SerialPort = require('serialport');

export interface SerialPortBaseBinding extends Duplex {
	__serial_port: never; // prevent type merge
}

export interface ILocalOptions {
	charset?: 'utf8' | 'binary';
	lineEnding?: 'No' | '\\n' | '\\r\\n' | '\\r' | '\\0';
	escape?: boolean;
	echo?: boolean;
}

export const serialPortCharset: ILocalOptions['charset'][] = ['utf8', 'binary'];
export const serialPortYesNoSelection = [true, false];
export const serialPortEOL: Map<ILocalOptions['lineEnding'], string> = new Map();
serialPortEOL.set('No', '');
serialPortEOL.set('\\n', '\n');
serialPortEOL.set('\\r\\n', '\r\n');
serialPortEOL.set('\\r', '\r');
serialPortEOL.set('\\0', '\x00');
export const serialPortEOLArr = Array.from<ILocalOptions['lineEnding']>(serialPortEOL.keys());

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