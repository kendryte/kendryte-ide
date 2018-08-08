import { BGA_IO_GEOMETRY, PinBuilder } from 'vs/workbench/parts/maix/fpioa-config/common/builder';
import { registryChipPackaging } from 'vs/workbench/parts/maix/fpioa-config/common/packagingRegistry';
import { IChipPackagingDefine, IFunc } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';

const graph = `
	!  1  2  3  4  5  6  7  8  9  10 11
	!*---------------------------------
	A| 19 20 22 24 26 28 30 32 34 36 38
	B| 17 18 23 25 27 29 31 33 35 37 39
	C| 15 16 21 -- -- -- -- -- 40 42 41
	D| 13 14 -- -- -- -- -- -- -- 44 43
	E| 11 12 -- -- -- -- -- -- -- 46 45
	F| 09 10 -- -- -- -- -- -- -- -- 47
	G| 07 08 -- -- -- -- -- -- -- -- --
	H| 05 06 -- -- -- -- -- -- -- -- --
	J| 03 04 02 -- -- -- -- -- -- -- --
	K| 01 -- -- -- -- -- -- -- -- -- --
	L| 00 -- -- -- -- -- -- -- -- -- --
`;

const Maix1BGAPackageDefine: IChipPackagingDefine = {
	name: 'Maix',
	geometry: BGA_IO_GEOMETRY(graph),
	generator: {
		funcNamePrefix: 'FUNC_',
		setterFuncName: 'fpioa_set_function',
		libraryName: 'fpioa',
	},
	usableFunctions: [
		{
			name: 'jtag', description: 'JTAG Test',
			ios: [
				{ name: 'tclk', funcNumber: 0, description: 'Clock' },
				{ name: 'TDI', funcNumber: 1, description: 'Data In' },
				{ name: 'TMS', funcNumber: 2, description: 'Mode Select' },
				{ name: 'TDO', funcNumber: 3, description: 'Data Out' },
			]
		},
		PinBuilder.spi(0, 4),
		PinBuilder.uart('hs', 'High speed', 18),
		{
			name: 'clk', description: 'Clock',
			ios: [
				{ name: 'in1', funcNumber: 20, description: 'Input 1' },
				{ name: 'in2', funcNumber: 21, description: 'Input 2' },
				{ name: 'spi1', funcNumber: 22, description: 'SPI1' },
				{ name: 'i2c1', funcNumber: 23, description: 'I2C1' },
				{ name: 'spi2', funcNumber: 202, description: 'SPI2' },
				{ name: 'i2c2', funcNumber: 203, description: 'I2C2' },
			]
		},
		{
			name: 'gpio', description: 'GPIO',
			ios: [
				...PinBuilder.gpio(32, 24, 'gpiohs', 'High speed'),
				...PinBuilder.gpio(8, 56, 'gpio', 'Pin'),
			]
		},
		PinBuilder.spi(1, 70),
		PinBuilder.i2s(0, 87, 4, 4),
		PinBuilder.i2s(1, 98, 4, 4),
		PinBuilder.i2s(2, 109, 4, 4),
		{
			name: 'resv', description: 'Reserved',
			ios: [
				...PinBuilder.dataPin(6, 120, '', 'function'),
			]
		},
		PinBuilder.i2c(0, 126),
		PinBuilder.i2c(1, 128),
		PinBuilder.i2c(2, 130),
		CMOS(132),
		{
			name: 'sccb', description: 'SCCB',
			ios: [
				{ name: 'sclk', funcNumber: 146, description: 'Serial Clock' },
				{ name: 'sda', funcNumber: 147, description: 'Serial Data' },
			]
		},
		uartWithControl(1, 64, 148),
		uartWithControl(2, 66, 162),
		uartWithControl(3, 66, 176),
		{
			name: 'sccb', description: 'SCCB',
			ios: [
				{ name: 'sclk', funcNumber: 146, description: 'Serial Clock' },
				{ name: 'sda', funcNumber: 147, description: 'Serial Data' },
			]
		},
		timer(0, 190),
		timer(1, 194),
		timer(2, 198),
		{
			name: 'jam', description: 'JamLink',
			ios: [
				{ name: 'co', funcNumber: 204, description: 'Control Output' },
				...PinBuilder.dataPin(8, 205, 'do', 'Data Output'),
				...PinBuilder.dataPin(4, 213, 'di', 'Data Input'),
				{ name: 'di4', funcNumber: 219, description: 'Control Input 4' },
				{ name: 'di5', funcNumber: 220, description: 'Control Input 5' },
				{ name: 'di6', funcNumber: 221, description: 'Control Input 6' },
				{ name: 'di7', funcNumber: 223, description: 'Control Input 7' },
			]
		},
		PinBuilder.i2c('2axi', 217),
		{
			name: 'constant', description: 'Constant',
			ios: [
				{ name: '', funcNumber: 222, description: 'function' },
			]
		},
		{
			name: 'debug', description: 'Debug',
			ios: [
				...PinBuilder.dataPin(32, 224, '', 'function')
			]
		},
	]
};

function CMOS(base: number): IFunc {
	return {
		name: 'cmos', description: 'DVP',
		ios: [
			{ name: 'xclk', funcNumber: base, description: 'System Clock' },
			{ name: 'rst', funcNumber: base + 1, description: 'System Reset' },
			{ name: 'pwnd', funcNumber: base + 2, description: 'Power Down Mode' },
			{ name: 'vsync', funcNumber: base + 3, description: 'Vertical Sync' },
			{ name: 'href', funcNumber: base + 4, description: 'Horizontal Reference output' },
			{ name: 'pclk', funcNumber: base + 5, description: 'Pixel Clock' },
			...PinBuilder.dataPin(8, base + 6, 'd', 'Data Bit')
		]
	};
}

function uartWithControl(id: number, uartBase: number, controlBase: number): IFunc {
	const uart = PinBuilder.uart(id.toString(), id.toString(), uartBase);

	uart.ios.push({ name: 'cts', funcNumber: controlBase++, description: 'Clear To Send' });
	uart.ios.push({ name: 'dsr', funcNumber: controlBase++, description: 'Data Set Ready' });
	uart.ios.push({ name: 'dcd', funcNumber: controlBase++, description: 'Data Carrier Detect' });
	uart.ios.push({ name: 'ri', funcNumber: controlBase++, description: 'Ring Indicator' });
	uart.ios.push({ name: 'sir_in', funcNumber: controlBase++, description: 'Serial Infrared Input' });
	uart.ios.push({ name: 'dtr', funcNumber: controlBase++, description: 'Data Terminal Ready' });
	uart.ios.push({ name: 'rts', funcNumber: controlBase++, description: 'Request To Send' });
	uart.ios.push({ name: 'out2', funcNumber: controlBase++, description: 'User-designated Output 2' });
	uart.ios.push({ name: 'out1', funcNumber: controlBase++, description: 'User-designated Output 1' });
	uart.ios.push({ name: 'sir_out', funcNumber: controlBase++, description: 'Serial Infrared Output' });
	uart.ios.push({ name: 'baud', funcNumber: controlBase++, description: 'Transmit Clock Output' });
	uart.ios.push({ name: 're', funcNumber: controlBase++, description: 'Receiver Output Enable' });
	uart.ios.push({ name: 'de', funcNumber: controlBase++, description: 'Driver Output Enable' });
	uart.ios.push({ name: 'rs485_en', funcNumber: controlBase++, description: 'RS485 Enable' });

	return uart;
}

function timer(id: number, base: number) {
	return {
		name: `timer${id}`, description: `TIMER${id}`,
		ios: PinBuilder.dataPin(4, base, 'TOGGLE', 'Toggle Output', 1)
	};
}

registryChipPackaging(Maix1BGAPackageDefine);
