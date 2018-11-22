import { resolve } from 'path';
import { isWin } from '../misc/constants';

const pathSp = isWin? ';' : ':';

export function mergeEnv() {
	const cwd = process.cwd();
	const newEnv: NodeJS.ProcessEnv = {
		PATH: '',
	};
	Object.keys(process.env).forEach((k) => {
		if (k.toLowerCase() === 'path') {
			newEnv.PATH += process.env[k] + pathSp;
		} else {
			newEnv[k] = process.env[k];
		}
	});
	
	newEnv.PATH += resolve(cwd, 'node_modules/.bin');
	newEnv.LANG = 'C';
	
	return {
		cwd,
		env: newEnv,
	};
}