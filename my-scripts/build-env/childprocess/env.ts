import { resolve } from 'path';
import { isWin } from '../misc/constants';

const pathSp = isWin? ';' : ':';

export function mergeEnv() {
	const cwd = process.cwd();
	const newEnv: NodeJS.ProcessEnv = {
		PATH: resolve(cwd, 'node_modules/.bin'),
	};
	Object.keys(process.env).forEach((k) => {
		if (k.toLowerCase() === 'path') {
			newEnv.PATH += pathSp + process.env[k];
		} else {
			newEnv[k] = process.env[k];
		}
	});
	return {
		cwd,
		env: newEnv,
	};
}