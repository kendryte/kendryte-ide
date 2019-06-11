import { ChipPackageType, IChipGeometry } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { BaseAny } from 'vs/kendryte/vs/workbench/fpioaConfig/common/baseAny';

const AlphaBet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LineStruct = /^([a-z]+)\|(.+)$/i;

export function BGA_IO_GEOMETRY(pinMap: string): IChipGeometry {
	const ret: IChipGeometry = {
		type: ChipPackageType.BGA,
		maxPin: {
			name: '',
			x: -1,
			y: -1,
		},
		missingRows: '',
		IOPinPlacement: {},
		NotePinPlacement: {},
	};
	const ioPins = new Map<{ row: string; col: number; }, number>();

	pinMap = pinMap.replace(/^\s+|\s+$/mg, '').trim(); // clear space around

	let alphaPtr = 0, lastLine = '', lastItem = 0, lock = false;

	const allLines = pinMap.split('\n');
	for (let row = 0; row < allLines.length; row++) {
		if (!LineStruct.test(allLines[row])) {
			if (lock) {
				throw new TypeError(`line structure wrong: ${allLines[row]}`);
			} else {
				continue;
			}
		}
		lock = true;

		let [, letter, line] = LineStruct.exec(allLines[row]) as string[];
		letter = letter.toUpperCase();
		lastLine = letter;

		if (letter.length === 1) {
			while (AlphaBet[alphaPtr] !== letter) {
				ret.missingRows += AlphaBet[alphaPtr];
				alphaPtr++;
				if (alphaPtr > AlphaBet.length - 1) {
					throw new Error('row order wrong.');
				}
			}
			alphaPtr++;
		}

		const allItems = line.trim().split(/\s+/g);
		lastItem = allItems.length;

		for (let col = 0; col < allItems.length; col++) {
			const item = allItems[col];

			if (item === '--') {
				continue;
			}
			if (isNaN(parseInt(item))) {
				ret.NotePinPlacement[letter + (col + 1).toString()] = item;
			} else {
				ioPins.set({ col: col + 1, row: letter }, parseInt(item));
			}
		}
	}

	if (!lock) {
		throw new TypeError('BGA io map wrong.');
	}

	ret.maxPin.name = lastLine + lastItem.toString();
	ret.maxPin.y = BaseAny.fromRevert(ret.missingRows).toBase10(lastLine);
	ret.maxPin.x = lastItem;

	let placement: string[] = [];
	ioPins.forEach((io: number, { col, row }) => {
		placement[io] = row + col.toString();
	});
	placement.forEach((name, io) => {
		ret.IOPinPlacement[name] = io;
	});

	return ret;
}
