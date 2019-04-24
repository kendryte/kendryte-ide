import { humanSize } from 'vs/kendryte/vs/base/common/speedShow';
import { DATA_LEN_WRITE_FLASH } from 'vs/kendryte/vs/platform/open/common/chipConst';

export function ceilAlign(address: number): number {
	const mod = address % DATA_LEN_WRITE_FLASH;
	if (mod > 0) {
		return address + (DATA_LEN_WRITE_FLASH - mod);
	} else {
		return address;
	}
}

export interface AllocInfo {
	from: number;
	to: number;
}

export class MemoryAllocationCalculator {
	private readonly freeSpace: [number, number][];

	constructor(
		base: number,
		size: number,
	) {
		this.freeSpace = [[base, size]];
	}

	public getLatestEnding() {
		const last = this.freeSpace[this.freeSpace.length - 1]!;
		return stringifyMemoryAddress(last[0]);
	}

	allocAuto(size: number): AllocInfo {
		size = ceilAlign(size);

		const allocAt = this.freeSpace.findIndex(([freeFrom, freeTo]) => {
			return freeTo - freeFrom >= size;
		});

		if (allocAt === -1) {
			throw new Error(`cannot alloc ${humanSize(size)}: no enough space`);
		}

		const current = this.freeSpace[allocAt];
		const [from, freeTo] = current;

		const freeSize = freeTo - from;

		if (freeSize === size) {
			this.freeSpace.splice(allocAt, 1);
		} else {
			current[0] += size;
		}

		return {
			from,
			to: from + size,
		};
	}

	allocManual(size: number, from: number): AllocInfo {
		size = ceilAlign(size);

		const to = from + size;
		const allocAt = this.freeSpace.findIndex(([freeFrom, freeTo]) => {
			return from >= freeFrom && to <= freeTo;
		});

		if (allocAt === -1) {
			throw new Error(`cannot alloc ${humanSize(size)} at ${stringifyMemoryAddress(from)}: no enough space`);
		}

		const current = this.freeSpace[allocAt];
		const [freeFrom, freeTo] = current;

		if (freeFrom === allocAt && freeTo === to) {
			this.freeSpace.splice(allocAt, 1);
		} else if (freeFrom === allocAt) {
			current[0] += size;
		} else if (freeTo === to) {
			current[1] -= size;
		} else {
			this.freeSpace.splice(allocAt, 1, [freeFrom, from], [to, freeTo]);
		}

		return {
			from,
			to,
		};
	}
}

export const validMemoryAddress = /^(?:0x)?([0-9a-fA-F]+)$/;

export function isValidFlashAddressString(v: string) {
	return validMemoryAddress.test(v);
}

export function stringifyMemoryAddress(value: number) {
	return '0x' + value.toString(16).toUpperCase();
}

export function parseMemoryAddress(value: string) {
	const m = validMemoryAddress.exec(value);
	if (!m) {
		return NaN;
	}

	return parseInt(m[1], 16);
}
