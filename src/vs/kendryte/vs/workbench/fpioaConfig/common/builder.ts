import { IChipInterface, IChipInterfaceClass, IPin, IPin2DNumber } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { BaseAny } from 'vs/kendryte/vs/workbench/fpioaConfig/common/baseAny';

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
		return { x: pin.x, y: typeof pin.y === 'string' ? base.toBase10(pin.y) : pin.y };
	}
}

export function flattenInterfaceList(devTree: (IChipInterface<any> | IChipInterfaceClass<any>)[]): IChipInterface<any>[] {
	const ret: IChipInterface<any>[] = [];
	for (const item of devTree) {
		if (isDeviceInterfaceClass(item)) {
			ret.push(...flattenInterfaceList((item as IChipInterfaceClass<any>).devices));
		} else {
			ret.push(item as IChipInterface<any>);
		}
	}
	return ret;
}

export function isDeviceInterfaceClass(item: IChipInterface<any> | IChipInterfaceClass<any>): item is IChipInterfaceClass<any> {
	return item.hasOwnProperty('devices');
}
