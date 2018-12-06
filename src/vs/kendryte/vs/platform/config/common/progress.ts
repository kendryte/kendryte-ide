import { IProgress, IProgressStep } from 'vs/platform/progress/common/progress';

export interface INatureProgressStatus {
	message: string;
	total: number;
	current: number;
}

export interface IProgressStatus {
	message: string;
	percent: number;
}

export class SubProgress {
	protected parts: number[];
	protected total: number;
	protected currentPart: number;

	private scheduleTimer: NodeJS.Immediate;
	private readonly scheduleObject: IProgressStatus;

	protected readonly currentObject: IProgressStatus;
	protected currentTotalPercentage: number;

	constructor(
		initMessage: string,
		protected readonly reporter: IProgress<IProgressStep>,
	) {

		this.currentObject = {
			message: '',
			percent: 0,
		};
		this.scheduleObject = {} as any;
		this.schedule({
			message: initMessage,
			percent: -1,
		});
	}

	protected schedule(change: Partial<IProgressStatus>) {
		if (this.scheduleTimer) {
			clearImmediate(this.scheduleTimer);
			this.scheduleTimer = null;
		}

		if (change.hasOwnProperty('message')) {
			this.scheduleObject.message = change.message;
		}
		if (change.hasOwnProperty('percent')) {
			this.scheduleObject.percent = change.percent;
		}

		// console.log('%d (schedule)', this.scheduleObject.percent);
		this.scheduleTimer = setImmediate(() => {
			this.doReport();
		});
	}

	get isInfinity(): boolean {
		return this.scheduleObject.percent === -1;
	}

	infinite() {
		if (!this.isInfinity) {
			this.schedule({ percent: -1 });
		}
	}

	message(message: string) {
		this.schedule({ message });
	}

	splitWith(parts: number[]) {
		this.total = 0;
		for (const value of parts) {
			if (value < 0) {
				throw new RangeError('can not have a part with count < 0');
			}
			this.total += value;
		}
		if (this.total <= 0) { // no parts
			throw new RangeError('total count must >0');
		}

		this.parts = parts.slice();
		this.currentPart = 0;
		this.currentTotalPercentage = 0;
	}

	next() {
		// console.log('--- next');
		this.currentPart++;
		if (this.currentPart === this.parts.length) {
			throw new RangeError('pop part out of range');
		}
		this.currentTotalPercentage += this.parts[this.currentPart - 1] / this.total;
		this.infinite();
	}

	progress(value: number) {
		// console.log('progress(%s)', value);
		if (this.parts[this.currentPart] === 0) {
			throw new RangeError('not in progress stage');
		}
		if (value < 0) {
			throw new RangeError('progress value must > 0');
		}

		this.schedule({
			percent: this.currentTotalPercentage + (value / this.parts[this.currentPart]),
		});
	}

	private doReport() {
		const report: IProgressStep = {};
		let anyChange = false;

		if (this.scheduleObject.message !== this.currentObject.message) {
			report.message = this.currentObject.message = this.scheduleObject.message;
			anyChange = true;
		}

		// console.log('%d => %d', this.currentObject.percent, this.scheduleObject.percent);
		if (this.currentObject.percent !== this.scheduleObject.percent) {
			const original = this.currentObject.percent;
			const originalInfinity = this.currentObject.percent === -1;
			const newValue = this.scheduleObject.percent;

			if (this.isInfinity) {
				report.increment = -1;
			} else if (originalInfinity) {
				report.increment = newValue;
			} else {
				const increment: number = newValue - original;
				if (increment < 0) {
					this.reporter.report({ increment: -1 }); // infinite first
					report.increment = newValue; // then normal value
				} else { // never === 0
					report.increment = increment;
				}
			}

			this.currentObject.percent = newValue;

			anyChange = true;
			report.increment = report.increment * 100;
			// console.log('report.increment = %s', report.increment);
			// console.log('progress = %s%%', newValue);
		}

		if (anyChange) {
			this.reporter.report(report);
		}
	}
}

export interface IProgressFn {
	(current: number | null, message?: string): void;
}

export function simpleProgressTranslate(reporter: IProgress<IProgressStep>): IProgressFn {
	let lastInfinite = false;
	let last = 0;

	return (current: number, m?: string) => {
		if (current === null) {
			lastInfinite = true;
			last = 0;
			reporter.report({ increment: -1, message: m });
		} else {
			if (lastInfinite) {
				lastInfinite = false;
			}

			const delta = current - last;
			reporter.report({ increment: delta, message: m });
			last = current;
		}
	};
}