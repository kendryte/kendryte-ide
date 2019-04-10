export class BaseAny {
	protected letterNumber: { [letter: string]: number };
	protected numberLetter: string;
	public readonly base: number;

	constructor(letters: string) {
		this.base = letters.length;
		this.letterNumber = {};
		this.numberLetter = ' ' + letters.trim().toUpperCase().slice();
		for (let value = 0; value < this.base; value++) {
			const letter = this.numberLetter[value];
			if (this.letterNumber[letter]) {
				throw new TypeError(`duplicate number: ${letter}`);
			}
			this.letterNumber[letter] = value;
		}
	}

	static fromRevert(letters: string) {
		const reverted = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.replace(new RegExp(`[${letters}]`, 'ig'), '');
		return new BaseAny(reverted);
	}

	toBase10(data: string): number {
		data = data.toUpperCase();
		let value = 0;
		let base = 1;
		for (let i = data.length - 1; i >= 0; i--) {
			const val = this.letterNumber[data[i]];
			if (isNaN(val)) {
				return NaN;
			}
			value += val * base;
			base *= this.base;
		}
		return value;
	}

	fromBase10(data: number): string {
		if (isNaN(data)) {
			return 'NaN';
		}
		if (data <= 0) {
			throw new RangeError('can not convert value <= 0');
		}

		let ret = '';
		while (data > 0) {
			const v = this.numberLetter[data % this.base];
			if (!v) {
				throw new RangeError(`invalid number: ${data} (${v})`);
			}
			ret = v + ret;
			data = Math.floor(data / this.base);
		}
		return ret;
	}
}