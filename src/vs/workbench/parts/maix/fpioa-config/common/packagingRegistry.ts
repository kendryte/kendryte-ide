import { deepClone } from 'vs/base/common/objects';
import { Registry } from 'vs/platform/registry/common/platform';
import { BaseAny } from 'vs/workbench/parts/maix/fpioa-config/common/baseAny';
import { IChipPackagingCalculated, IChipPackagingDefine, IPin, IPinRange } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { normalizePin } from 'vs/workbench/parts/maix/fpioa-config/common/builder';

const FirstPin: IPin = 1;

export enum Extensions {
	ChipPackaging = 'maix.chipPackaging'
}

export interface IChipPackagingRegistry {
	addPackaging(packaging: IChipPackagingDefine): void;

	getByName(name: string): IChipPackagingCalculated;

	getList(): IChipPackagingCalculated[];
}

export function registryChipPackaging(packaging: IChipPackagingDefine) {
	Registry.as<IChipPackagingRegistry>(Extensions.ChipPackaging).addPackaging(packaging);
}

export function getChipPackaging(name: string): IChipPackagingCalculated | null;
export function getChipPackaging(): IChipPackagingCalculated[];

export function getChipPackaging(name?: string) {
	if (name) {
		return registry.getByName(name);
	} else {
		return registry.getList();
	}
}

const registry = new class implements IChipPackagingRegistry {
	private map = new Map<string, IChipPackagingCalculated>();

	addPackaging(packaging: IChipPackagingDefine) {
		const copy = deepClone(packaging);

		const base = BaseAny.fromRevert(copy.geometry.missingRows);

		if (!copy.geometry.emptyRange) {
			copy.geometry.emptyRange = [];
		}

		let pinCount = pinCountWithin(base, { from: FirstPin, to: copy.geometry.maxPin.name });

		for (const item of copy.geometry.emptyRange) {
			pinCount -= pinCountWithin(base, item);
		}

		this.map.set(copy.name, {
			...copy,
			pinCount,
			ROW: base
		});
	}

	getList() {
		const ret: IChipPackagingCalculated[] = [];
		this.map.forEach(def => ret.push(def));
		return ret;
	}

	getByName(name: string) {
		return this.map.get(name);
	}
};
Registry.add(Extensions.ChipPackaging, registry);

function pinCountWithin(base: BaseAny, range: IPinRange) {
	const from = normalizePin(base, range.from);
	const to = normalizePin(base, range.to);

	return (to.x - from.x + 1) * (to.y - from.y + 1);
}
