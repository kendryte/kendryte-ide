export interface OpenOptions {
	autoOpen?: boolean;
	baudRate?: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 | 1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
	dataBits?: 8 | 7 | 6 | 5;
	highWaterMark?: number;
	lock?: boolean;
	stopBits?: 1 | 2;
	parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';
	rtscts?: boolean;
	xon?: boolean;
	xoff?: boolean;
	xany?: boolean;
	binding?: BaseBinding;
	bindingOptions?: {
		vmin?: number;
		vtime?: number;
	};
}

export interface SetOptions {
	brk?: boolean;
	cts?: boolean;
	dsr?: boolean;
	dtr?: boolean;
	rts?: boolean;
}

export interface UpdateOptions {
	baudRate?: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 | 1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
}

declare class BaseBinding {
	constructor(options: any);

	open(path: string, options: OpenOptions): Promise<any>;

	close(): Promise<any>;

	read(data: Buffer, offset: number, length: number): Promise<any>;

	write(data: Buffer): Promise<any>;

	update(options?: UpdateOptions): Promise<any>;

	set(options?: SetOptions): Promise<any>;

	get(): Promise<any>;

	flush(): Promise<any>;

	drain(): Promise<any>;

	static list(): Promise<any>;
}

export interface OpenOptions {
	autoOpen?: boolean;
	baudRate?: 115200 | 57600 | 38400 | 19200 | 9600 | 4800 | 2400 | 1800 | 1200 | 600 | 300 | 200 | 150 | 134 | 110 | 75 | 50 | number;
	dataBits?: 8 | 7 | 6 | 5;
	highWaterMark?: number;
	lock?: boolean;
	stopBits?: 1 | 2;
	parity?: 'none' | 'even' | 'mark' | 'odd' | 'space';
	rtscts?: boolean;
	xon?: boolean;
	xoff?: boolean;
	xany?: boolean;
	binding?: BaseBinding;
	bindingOptions?: {
		vmin?: number;
		vtime?: number;
	};
}