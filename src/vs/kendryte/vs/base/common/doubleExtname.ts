import { basename } from 'vs/base/common/paths';

const tester = /(\.[^.]+)?(\.[^.]+)$/;
const allow2nd = /^\.(tar)$/i;

export function doubleExtname(path: string) {
	const exts = tester.exec(basename(path));
	if (!exts) {
		return '';
	}
	if (exts[1]) {
		if (allow2nd.test(exts[1])) {
			return exts[0];
		} else {
			return exts[2];
		}
	} else { // 1 ext
		return exts[0];
	}
}