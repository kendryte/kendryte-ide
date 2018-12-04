import { normalize, resolve } from 'path';
import { RELEASE_ROOT } from './constants';
import { mkdirpSync } from './fsUtil';

export function chdir(d: string) {
	d = normalize(d);
	if (process.cwd() !== d) {
		console.log('\r\x1BK > %s', d);
		process.chdir(d);
	}
}

export function ensureChdir(p: string) {
	p = normalize(p);
	mkdirpSync(p);
	return chdir(p);
}

export function yarnPackageDir(what: string) {
	return resolve(RELEASE_ROOT, 'yarn-dir', what);
}