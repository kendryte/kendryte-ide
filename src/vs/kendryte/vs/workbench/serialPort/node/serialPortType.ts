import { Duplex } from 'stream';
import { SerialPortCloseReason, SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { Event } from 'vs/base/common/event';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import SerialPort = require('serialport');

export interface SerialPortBaseBinding extends Duplex {
	__serial_port: never; // prevent type merge
	beforeClose: Event<SerialPortCloseReason>;
}

export interface ILocalOptions {
	outputCharset: undefined | 'binary' | 'utf8' | 'hex' | 'hexasc';
	inputCharset: undefined | 'latin1' | 'utf8' | 'hex';
	lineEnding: undefined | 'No' | '\\n' | '\\r\\n' | '\\r' | '\\0';
	escape: undefined | boolean;
	echo: undefined | boolean;
	translateLineFeed: undefined | 'No' | '\\n' | '\\r\\n' | '\\r';
	hexLineFeed: undefined | boolean;
}

export const inputCharset: ILocalOptions['inputCharset'][] = ['latin1', 'utf8', 'hex'];
export const outputCharset: ILocalOptions['outputCharset'][] = ['binary', 'utf8', 'hex', 'hexasc'];
export const serialPortYesNoSelection = [true, false];
export const serialPortEOL = new ExtendMap<ILocalOptions['lineEnding'], string>();
serialPortEOL.set('No', '');
serialPortEOL.set('\\n', '\n');
serialPortEOL.set('\\r\\n', '\r\n');
serialPortEOL.set('\\r', '\r');
serialPortEOL.set('\\0', '\x00');
export const serialPortEOLArr = Array.from<ILocalOptions['lineEnding']>(serialPortEOL.keys());

export const serialPortLF = new ExtendMap<ILocalOptions['translateLineFeed'], string>();
serialPortLF.set('No', '');
serialPortLF.set('\\n', '\n');
serialPortLF.set('\\r\\n', '\r\n');
serialPortLF.set('\\r', '\r');
export const serialPortLFArr = Array.from<ILocalOptions['translateLineFeed']>(serialPortLF.keys());

export type IFullSerialOptions = ILocalOptions & SerialPort.OpenOptions;
export const defaultConfig: ILocalOptions = {
	lineEnding: '\\n',
	escape: true,
	echo: false,
	translateLineFeed: '\\n',
	outputCharset: 'binary',
	inputCharset: 'latin1',
	hexLineFeed: false,
};

export interface ISerialPortStatus {
	paused: boolean;
	id: string;
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