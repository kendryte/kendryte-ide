import { registryChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { IChipPackagingDefinition } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { DefaultChipName } from 'vs/kendryte/vs/base/common/jsonSchemas/deviceManagerSchema';
import { Maix1 } from './maix1.functions';
import { localize } from 'vs/nls';
import { BGA_IO_GEOMETRY } from 'vs/kendryte/vs/workbench/fpioaConfig/common/bga';

const graph = `
	!  1  2  3  4  5  6  7  8  9  10 11 12
	!*------------------------------------
	A| 37 36 35 33 31 29 27 25 23 21 19 17
	B| 39 38 34 32 30 28 26 24 22 20 18 16
	C| 41 40 -- -- -- -- -- -- -- -- 14 15
	D| 43 42 -- -- -- -- -- -- -- -- 12 13
	E| 45 44 -- -- -- -- -- -- -- -- 10 11
	F| 47 46 -- -- -- -- -- -- -- -- 08 09
	G| -- -- -- -- -- -- -- -- -- -- 06 07
	H| -- -- -- -- -- -- -- -- -- -- 04 05
	J| -- -- -- -- -- -- -- -- -- -- 02 03 
	K| -- -- -- -- -- -- -- -- -- -- 00 01
	L| -- -- -- -- -- -- -- -- -- -- -- --
	M| -- -- -- -- -- -- -- -- -- -- -- --
`;

const Maix1BGAPackageDefine: IChipPackagingDefinition<typeof Maix1.FunctionList> = {
	name: DefaultChipName,
	geometry: BGA_IO_GEOMETRY(graph),
	generator: {
		funcNamePrefix: 'FUNC_',
		setterFuncName: 'fpioa_set_function',
		libraryName: 'fpioa',
	},
	interfaceList: [
		{
			id: 'spi', title: localize('spi', 'SPI'), devices: [
				{ id: 'spi0', title: localize('spi0', 'SPI 0'), functions: Maix1.SPI0 },
				{ id: 'spi1', title: localize('spi1', 'SPI 1'), functions: Maix1.SPI1 },
				{ id: 'spiSlave', title: localize('spiSlave', 'SPI slave'), functions: Maix1.SPISLAVE },
			],
		},
		{
			id: 'gpio', title: localize('gpio', 'GPIO'), devices: [
				{ id: 'gpio', title: localize('gpio', 'GPIO'), functions: Maix1.GPIO },
				{ id: 'highspeedGpio', title: localize('highspeedGpio', 'High speed GPIO'), functions: Maix1.GPIOHS },
			],
		},
		{
			id: 'uart', title: localize('uart', 'UART'), devices: [
				{ id: 'uart1', title: localize('uart1', 'UART'), functions: Maix1.UART1 },
				{ id: 'uart2', title: localize('uart2', 'UART'), functions: Maix1.UART2 },
				{ id: 'uart3', title: localize('uart3', 'UART'), functions: Maix1.UART3 },
				{ id: 'highspeedUart', title: localize('highspeedUart', 'High speed UART'), functions: Maix1.UARTHS },
			],
		},
		{
			id: 'i2s', title: localize('i2s', 'I2S'), devices: [
				{ id: 'i2s0', title: localize('i2s0', 'I2S 0'), functions: Maix1.I2S0 },
				{ id: 'i2s1', title: localize('i2s1', 'I2S 1'), functions: Maix1.I2S1 },
				{ id: 'i2s2', title: localize('i2s2', 'I2S 2'), functions: Maix1.I2S2 },
			],
		},
		{
			id: 'i2c', title: localize('i2c', 'I2C'), devices: [
				{ id: 'i2c0', title: localize('i2c0', 'I2C 0'), functions: Maix1.I2C0 },
				{ id: 'i2c1', title: localize('i2c1', 'I2C 1'), functions: Maix1.I2C1 },
				{ id: 'i2c2', title: localize('i2c2', 'I2C 2'), functions: Maix1.I2C2 },
			],
		},
		{
			id: 'camera', title: localize('camera', 'Camera interface'), devices: [
				{ id: 'dvp', title: localize('dvp', 'DVP'), functions: Maix1.DVP },
				{ id: 'sccb', title: localize('sccb', 'SCCB'), functions: Maix1.SCCB },
			],
		},
		{
			id: 'timer', title: localize('timer', 'Timer output'), devices: [
				{ id: 'timer0', title: localize('timer0', 'Timer 0'), functions: Maix1.TMR0 },
				{ id: 'timer1', title: localize('timer1', 'Timer 1'), functions: Maix1.TMR1 },
				{ id: 'timer2', title: localize('timer2', 'Timer 2'), functions: Maix1.TMR2 },
			],
		},
		{
			id: 'others', title: localize('others', 'Others'), devices: [
				{ id: 'jtag', title: localize('jtag', 'JTag'), functions: Maix1.JTAG },
				{ id: 'misc', title: localize('misc', 'Misc'), functions: Maix1.MISC },
				{ id: 'timer', title: localize('timer', 'PLL Output'), functions: Maix1.PLL },
			],
		},
	],
};

registryChipPackaging(Maix1BGAPackageDefine);
