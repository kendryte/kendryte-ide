import { isWindows } from 'vs/base/common/platform';

export function isSameDrive(a: string, b: string) {
	if (!isWindows) {
		return true;
	}

	const adl = a.slice(0, 2).toLowerCase();
	const bdl = b.slice(0, 2).toLowerCase();
	if (adl[0] === bdl[0]) {
		if (adl[0] === '/' || adl[0] === '\\') {
			return true;
		}
		if (adl[1] === ':' && bdl[1] === ':') {
			return true;
		}
	}
	return false;
}