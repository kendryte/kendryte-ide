import { BGA_IO_GEOMETRY, PinBuilder } from 'vs/kendryte/vs/workbench/fpioaConfig/common/builder';
import { registryChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { IChipPackagingDefinition, IFuncDefinition } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';

const graph = `
	!  1  2  3  4  5  6  7  8  9  10 11 12
	!*------------------------------------
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
	M| 00 -- -- -- -- -- -- -- -- -- --
`;

const Maix1BGAPackageDefine: IChipPackagingDefinition = {
	name: 'Kendryte K210',
	geometry: BGA_IO_GEOMETRY(graph),
	generator: {
		funcNamePrefix: 'FUNC_',
		setterFuncName: 'fpioa_set_function',
		libraryName: 'fpioa',
	},
	usableFunctions: [
		{
			funcBaseId: 'jtag', description: 'JTAG Test',
			ios: [
				{ funcId: 'tclk', funcNumber: 0, description: 'Clock' },
				{ funcId: 'TDI', funcNumber: 1, description: 'Data In' },
				{ funcId: 'TMS', funcNumber: 2, description: 'Mode Select' },
				{ funcId: 'TDO', funcNumber: 3, description: 'Data Out' },
			],
		},
		PinBuilder.spi(0, 4),
		PinBuilder.uart('hs', 'High speed', 18),
		{
			funcBaseId: 'clk', description: 'Clock',
			ios: [
				{ funcId: 'in1', funcNumber: 20, description: 'Input 1' },
				{ funcId: 'in2', funcNumber: 21, description: 'Input 2' },
				{ funcId: 'spi1', funcNumber: 22, description: 'SPI1' },
				{ funcId: 'i2c1', funcNumber: 23, description: 'I2C1' },
				{ funcId: 'spi2', funcNumber: 202, description: 'SPI2' },
				{ funcId: 'i2c2', funcNumber: 203, description: 'I2C2' },
			],
		},
		{
			funcBaseId: 'gpio', description: 'GPIO',
			ios: [
				...PinBuilder.gpio(32, 24, 'hs', 'High speed'),
				...PinBuilder.gpio(8, 56, '', 'Pin'),
			],
		},
		PinBuilder.spi(1, 70),
		PinBuilder.i2s(0, 87, 4, 4),
		PinBuilder.i2s(1, 98, 4, 4),
		PinBuilder.i2s(2, 109, 4, 4),
		{
			funcBaseId: 'resv', description: 'Reserved',
			ios: [
				...PinBuilder.dataPin(6, 120, '', 'function'),
			],
		},
		PinBuilder.i2c(0, 126),
		PinBuilder.i2c(1, 128),
		PinBuilder.i2c(2, 130),
		CMOS(132),
		{
			funcBaseId: 'sccb', description: 'SCCB',
			ios: [
				{ funcId: 'sclk', funcNumber: 146, description: 'Serial Clock' },
				{ funcId: 'sda', funcNumber: 147, description: 'Serial Data' },
			],
		},
		uartWithControl(1, 64, 148),
		uartWithControl(2, 66, 162),
		uartWithControl(3, 66, 176),
		{
			funcBaseId: 'sccb', description: 'SCCB',
			ios: [
				{ funcId: 'sclk', funcNumber: 146, description: 'Serial Clock' },
				{ funcId: 'sda', funcNumber: 147, description: 'Serial Data' },
			],
		},
		timer(0, 190),
		timer(1, 194),
		timer(2, 198),
		{
			funcBaseId: 'jam', description: 'JamLink',
			ios: [
				{ funcId: 'co', funcNumber: 204, description: 'Control Output' },
				...PinBuilder.dataPin(8, 205, 'do', 'Data Output'),
				...PinBuilder.dataPin(4, 213, 'di', 'Data Input'),
				{ funcId: 'di4', funcNumber: 219, description: 'Control Input 4' },
				{ funcId: 'di5', funcNumber: 220, description: 'Control Input 5' },
				{ funcId: 'di6', funcNumber: 221, description: 'Control Input 6' },
				{ funcId: 'di7', funcNumber: 223, description: 'Control Input 7' },
			],
		},
		PinBuilder.i2c('2axi', 217),
		{
			funcBaseId: 'constant', description: 'Constant',
			ios: [
				{ funcId: '', funcNumber: 222, description: 'function' },
			],
		},
		{
			funcBaseId: 'debug', description: 'Debug',
			ios: [
				...PinBuilder.dataPin(32, 224, '', 'function'),
			],
		},
	],
};

function CMOS(base: number): IFuncDefinition {
	return {
		funcBaseId: 'cmos', description: 'DVP',
		ios: [
			{ funcId: 'xclk', funcNumber: base, description: 'System Clock' },
			{ funcId: 'rst', funcNumber: base + 1, description: 'System Reset' },
			{ funcId: 'pwnd', funcNumber: base + 2, description: 'Power Down Mode' },
			{ funcId: 'vsync', funcNumber: base + 3, description: 'Vertical Sync' },
			{ funcId: 'href', funcNumber: base + 4, description: 'Horizontal Reference output' },
			{ funcId: 'pclk', funcNumber: base + 5, description: 'Pixel Clock' },
			...PinBuilder.dataPin(8, base + 6, 'd', 'Data Bit'),
		],
	};
}

function uartWithControl(id: number, uartBase: number, controlBase: number): IFuncDefinition {
	const uart = PinBuilder.uart(id.toString(), id.toString(), uartBase);

	uart.ios.push({ funcId: 'cts', funcNumber: controlBase++, description: 'Clear To Send' });
	uart.ios.push({ funcId: 'dsr', funcNumber: controlBase++, description: 'Data Set Ready' });
	uart.ios.push({ funcId: 'dcd', funcNumber: controlBase++, description: 'Data Carrier Detect' });
	uart.ios.push({ funcId: 'ri', funcNumber: controlBase++, description: 'Ring Indicator' });
	uart.ios.push({ funcId: 'sir_in', funcNumber: controlBase++, description: 'Serial Infrared Input' });
	uart.ios.push({ funcId: 'dtr', funcNumber: controlBase++, description: 'Data Terminal Ready' });
	uart.ios.push({ funcId: 'rts', funcNumber: controlBase++, description: 'Request To Send' });
	uart.ios.push({ funcId: 'out2', funcNumber: controlBase++, description: 'User-designated Output 2' });
	uart.ios.push({ funcId: 'out1', funcNumber: controlBase++, description: 'User-designated Output 1' });
	uart.ios.push({ funcId: 'sir_out', funcNumber: controlBase++, description: 'Serial Infrared Output' });
	uart.ios.push({ funcId: 'baud', funcNumber: controlBase++, description: 'Transmit Clock Output' });
	uart.ios.push({ funcId: 're', funcNumber: controlBase++, description: 'Receiver Output Enable' });
	uart.ios.push({ funcId: 'de', funcNumber: controlBase++, description: 'Driver Output Enable' });
	uart.ios.push({ funcId: 'rs485_en', funcNumber: controlBase++, description: 'RS485 Enable' });

	return uart;
}

function timer(id: number, base: number): IFuncDefinition {
	return {
		funcBaseId: `timer${id}`, description: `TIMER${id}`,
		ios: PinBuilder.dataPin(4, base, 'TOGGLE', 'Toggle Output', 1),
	};
}

registryChipPackaging(Maix1BGAPackageDefine);
