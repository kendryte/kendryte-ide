import { BGA_IO_GEOMETRY, PinBuilder } from 'vs/kendryte/vs/workbench/fpioaConfig/common/builder';
import { registryChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { IChipPackagingDefinition } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';

const graph = `
	!  1  2  3  4  5  6  7  8 
	!*------------------------
	A| 16 15 14 13 12 11 10 09
	B| 01 02 03 04 05 06 07 08
`;

const test: IChipPackagingDefinition = {
	name: 'Test BGA-16',
	geometry: BGA_IO_GEOMETRY(graph),
	generator: {
		funcNamePrefix: 'xxxxx.',
		setterFuncName: 'set_io',
		libraryName: 'not-exists',
	},
	usableFunctions: [
		{
			funcBaseId: 'gpio', description: 'GPIO',
			ios: [
				...PinBuilder.gpio(14, 0, 'gpio', 'Pin'),
			]
		},
	]
};

registryChipPackaging(test);
