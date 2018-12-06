import { mkdirpSync } from 'fs-extra';
import { resolve } from 'path';

export function fakeTemp(output: NodeJS.WritableStream) {
	if (process.env._NPM_WRAP_TMP) {
		return;
	}
	process.env._NPM_WRAP_TMP = process.env.TEMP;
	const temp = process.env.TEMP;
	const fakePath = resolve(temp, 'build-cache', Date.now().toFixed(0));
	output.write(`Set HOME and TEMP to ${fakePath}\n`);
	mkdirpSync(fakePath);
	process.env.HOME = resolve(fakePath, 'home');
	process.env.TEMP = process.env.TMP = resolve(fakePath, 'tmp');
}