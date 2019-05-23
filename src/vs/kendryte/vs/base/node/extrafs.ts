import { lstat } from 'vs/base/node/pfs';

export function lstatExists(file: string) {
	return lstat(file).then(() => {
		return true;
	}, () => {
		return false;
	});
}
