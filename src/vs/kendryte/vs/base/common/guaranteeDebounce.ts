import { createDecorator } from 'vs/base/common/decorators';

/** @deprecated Logic Wrong! */
export function preventCallFast(delay: number): Function {
	return createDecorator((fn, key) => {
		const timerKey = `$guarantee$debounce$${key}`;
		const argsKey = `$guarantee$debounce$args$${key}`;

		return function (this: any, ...args: any[]) {
			if (!this[argsKey]) {
				fn.apply(this, args);
				this[argsKey] = args;
				return;
			}

			this[argsKey] = args;
			if (this.hasOwnProperty(timerKey)) {
				return;
			}

			this[timerKey] = setTimeout(() => {
				delete this[timerKey];
				fn.apply(this, this[argsKey]);
				delete this[argsKey];
			}, delay);
		};
	});
}
