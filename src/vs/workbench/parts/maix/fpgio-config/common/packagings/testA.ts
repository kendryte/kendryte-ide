import { BGA_IO_GEOMETRY, PinBuilder } from 'vs/workbench/parts/maix/fpgio-config/common/builder';
import { registryChipPackaging } from 'vs/workbench/parts/maix/fpgio-config/common/packagingRegistry';
import { IChipPackagingDefine } from 'vs/workbench/parts/maix/fpgio-config/common/packagingTypes';

const graph = `
	!  1  2  3  4  5  6  7  8 
	!*------------------------
	A| 16 15 14 13 12 11 10 09
	B| 01 02 03 04 05 06 07 08
`;

const test: IChipPackagingDefine = {
	name: 'Test BGA-16',
	geometry: BGA_IO_GEOMETRY(graph),
	usableFunctions: [
		{
			name: 'gpio', description: 'GPIO',
			ios: [
				...PinBuilder.gpio(14, 0, '', 'Pin'),
			]
		},
	]
};

registryChipPackaging(test);
