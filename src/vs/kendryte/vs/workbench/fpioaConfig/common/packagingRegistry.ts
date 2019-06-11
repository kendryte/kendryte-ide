import { deepClone } from 'vs/base/common/objects';
import { Registry } from 'vs/platform/registry/common/platform';
import { BaseAny } from 'vs/kendryte/vs/workbench/fpioaConfig/common/baseAny';
import { FunctionLabelMap, IChipPackagingCalculated, IChipPackagingDefinition, IPin, IPinRange } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { normalizePin } from 'vs/kendryte/vs/workbench/fpioaConfig/common/builder';

const FirstPin: IPin = 1;

export enum Extensions {
	ChipPackaging = 'maix.chipPackaging'
}

export interface IChipPackagingRegistry {
	addPackaging(packaging: IChipPackagingDefinition<FunctionLabelMap>): void;

	getByName(name: string): IChipPackagingCalculated | undefined;

	getList(): IChipPackagingCalculated[];
}

export function registryChipPackaging(packaging: IChipPackagingDefinition<FunctionLabelMap>) {
	Registry.as<IChipPackagingRegistry>(Extensions.ChipPackaging).addPackaging(packaging);
}

export function getChipPackaging(name: string | undefined): IChipPackagingCalculated | undefined;
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

	addPackaging(packaging: IChipPackagingDefinition<FunctionLabelMap>) {
		const copy = deepClone(packaging);

		const base = BaseAny.fromRevert(copy.geometry.missingRows);

		if (!copy.geometry.emptyRange) {
			copy.geometry.emptyRange = [];
		}

		let pinCount = pinCountWithin(base, { from: FirstPin, to: copy.geometry.maxPin.name });

		for (const item of copy.geometry.emptyRange) {
			pinCount -= pinCountWithin(base, item);
		}

		const obj: IChipPackagingCalculated = {
			...copy,
			pinCount,
			ROW: base,
		};

		this.map.set(copy.name, obj);
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
