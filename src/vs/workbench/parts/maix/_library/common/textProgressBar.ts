import { IDisposable } from 'vs/base/common/lifecycle';

export class TextProgressBar implements IDisposable {
	protected readonly bar: string[];
	protected readonly speed: number = 200;
	protected ti: number;

	private direction = 1;
	private current = 0;

	constructor(
		protected readonly size: number,
		public readonly barEmpty: string = '▱',
		public readonly barFill: string = '▰',
	) {
		this.bar = new Array(size).fill(this.barEmpty);
	}

	/** @param p 0~100 */
	percent(p: number) {
		const current = Math.ceil(p / (100 / this.size));
		if (this.ti) {
			this.dispose();
			// this.current === 0;
			if (current !== 0) {
				this.bar.fill(this.barFill, 0, current);
				this.current = current;
			}
		} else if (current !== this.current) {
			this.bar.fill(this.barFill, 0, current);
			this.current = current;
		}
	}

	infinite() {
		this.bar.fill(this.barEmpty);
		this.ti = setInterval(() => {
			let next = this.current + this.direction;
			if (next === this.bar.length || next === -1) {
				this.direction = -this.direction;
				next = this.current + this.direction;
			}
			this.bar[this.current] = this.barEmpty;
			this.bar[next] = this.barFill;
			this.current = next;
		}, this.speed);
	}

	dispose() {
		if (this.ti) {
			clearTimeout(this.ti);
			this.ti = null;
			this.bar[this.current] = this.barEmpty;
			this.current = 0;
		}
	}

	toString() {
		return this.bar.join('');
	}
}