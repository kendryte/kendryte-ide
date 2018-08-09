import { ISelectData, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IDisposable } from 'vs/base/common/lifecycle';

export interface SelectDataCallback {
	(event: ISelectData&{last: number}): void;
}

export function selectValueCache(input: SelectBox, targetEvent: SelectDataCallback): IDisposable {
	let current: number = (input as any).selectBoxDelegate.selected;
	let firing = false;

	const oldSelect = input.select.bind(input);

	input.select = (index: number) => {
		console.log('raw select:', index);
		if (current === index) {
			return;
		}
		current = index;
		oldSelect(index);
	};

	return input.onDidSelect((sel: ISelectData) => {
		console.log('raw onDidSelect:', sel.index);
		if (firing) {
			current = sel.index;
			return;
		}
		if (sel.index !== current) {
			firing = true;
			try {
				targetEvent({
					...sel,
					last: current,
				});
			} catch (e) {
				firing = false;
				current = sel.index;
				throw e;
			}
			firing = false;
			current = sel.index;
		}
	});
}