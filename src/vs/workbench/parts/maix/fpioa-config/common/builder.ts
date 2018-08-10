import { ChipPackageType, IChipGeometry, IFuncDefinition, IFuncPinDefinition, IPin, IPin2DNumber } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { BaseAny } from 'vs/workbench/parts/maix/fpioa-config/common/baseAny';

export class PinBuilder {
	static gpio(count: number, base: number, idPrefix: string, descPrefix: string): IFuncPinDefinition[] {
		return PinBuilder.dataPin(count, base, `${idPrefix}`, descPrefix, 0, { overwriteParentId: 'GPIO' });
	}

	static dataPin(count: number, base: number, idPrefix: string, descPrefix: string, nameBase: number = 0, extra: Partial<IFuncPinDefinition> = {}): IFuncPinDefinition[] {
		const ret: IFuncPinDefinition[] = [];
		for (let i = 0; i < count; i++) {
			ret.push({
				funcId: `${idPrefix}${i + nameBase}`,
				funcNumber: base + i,
				description: `${descPrefix} ${i + nameBase}`,
				...extra,
			});
		}
		return ret;
	}

	static uart(id: string, desc: string, base: number): IFuncDefinition {
		return {
			funcBaseId: `uart${id}`, description: `UART ${desc}`,
			ios: [
				{ funcId: 'rx', funcNumber: base, description: 'Receiver' },
				{ funcId: 'tx', funcNumber: base + 1, description: 'Transmitter' },
			],
		};
	}

	static spi(id: number, base: number, description: string = `SPI ${id}`): IFuncDefinition {
		return {
			funcBaseId: `spi${id}`, description,
			ios: [
				...PinBuilder.dataPin(8, base, 'd', 'Data'),
				...PinBuilder.dataPin(4, base + 8, 'cs', 'Chip Select'),
				{ funcId: 'arb', funcNumber: base + 8 + 4, description: 'Arbitration' },
				{ funcId: 'sclk', funcNumber: base + 8 + 4 + 1, description: 'Serial Clock' },
			],
		};
	}

	static spiSlave(base: number): IFuncDefinition {
		return {
			funcBaseId: 'spi_slave', description: 'SPI Slave',
			ios: [
				{ funcId: 'd0', funcNumber: base + 1, description: 'Data 0' },
				{ funcId: 'cs', funcNumber: base + 2, description: 'Chip Select' },
				{ funcId: 'sclk', funcNumber: base + 31, description: 'Serial Clock' },
			],
		};
	}

	static i2s(id: number, base: number, input: number, output: number): IFuncDefinition {
		return {
			funcBaseId: `i2s${id}`, description: `I2S${id}`,
			ios: [
				{ funcId: 'mclk', funcNumber: base, description: 'Master Clock' },
				{ funcId: 'sclk', funcNumber: base + 1, description: 'Serial Clock(BCLK)' },
				{ funcId: 'ws', funcNumber: base + 2, description: 'Word Select(LRCLK)' },
				...this.dataPin(input, base + 3, 'in_d', 'Serial Data Input'),
				...this.dataPin(output, base + 3 + input, 'out_d', 'Serial Data Output'),
			],
		};
	}

	static i2c(id: number|string, base: number): IFuncDefinition {
		return {
			funcBaseId: `i2c${id}`, description: `I2C${id}`,
			ios: [
				{ funcId: 'sclk', funcNumber: base, description: 'Serial Clock' },
				{ funcId: 'sda', funcNumber: base + 1, description: 'Serial Data' },
			],
		};
	}
}

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
	};
	const ioPins = new Map<{row: string; col: number;}, number>();

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

		let [, letter, line] = LineStruct.exec(allLines[row]);
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

			ioPins.set({ col: col + 1, row: letter }, parseInt(item));
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

const parsePin = /^([a-z]+)?([0-9]+)$/i;

export function stringifyPin(base: BaseAny, pin: IPin): string {
	const { x, y } = normalizePin(base, pin);
	return base.fromBase10(y) + x.toString();
}

export function normalizePin(base: BaseAny, pin: IPin): IPin2DNumber {
	if (typeof pin === 'number') {
		return { x: pin, y: 1 };
	} else if (typeof pin === 'string') {
		const p = parsePin.exec(pin);
		if (!p) {
			throw new TypeError(`${pin} is not a valid pin number.`);
		}
		return { x: parseInt(p[2]), y: base.toBase10(p[1] || 'A') };
	} else {
		return { x: pin.x, y: typeof pin.y === 'string'? base.toBase10(pin.y) : pin.y };
	}
}
