interface CopySerialPortModuleOpenOptions {
	// autoOpen: boolean; -- handled by service
	baudRate: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 | 1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
	dataBits: 8 | 7 | 6 | 5;
	highWaterMark: number;
	// lock: boolean; <-- windows do not support
	stopBits: 1 | 2;
	parity: 'none' | 'even' | 'mark' | 'odd' | 'space';
	rtscts: boolean;
	xon: boolean;
	xoff: boolean;
	xany: boolean;
	/*binding: xxx; // never change
	bindingOptions: {
		vmin: number;
		vtime: number;
	};*/
}

interface CopySerialPortModuleSetOptions {
	brk?: boolean;
	cts?: boolean;
	dsr?: boolean;
	dtr?: boolean;
	rts?: boolean;
}

export type SetOptions = CopySerialPortModuleSetOptions;
export type OpenOptions = CopySerialPortModuleOpenOptions;

export function nullOpenOptions(): OpenOptions {
	return <Partial<OpenOptions>>{
		baudRate: undefined,
		dataBits: undefined,
		highWaterMark: undefined,
		stopBits: undefined,
		parity: undefined,
		rtscts: undefined,
		xon: undefined,
		xoff: undefined,
		xany: undefined,
	} as OpenOptions;
}
