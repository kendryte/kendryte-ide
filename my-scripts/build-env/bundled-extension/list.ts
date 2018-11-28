import { readdir } from 'fs-extra';
import { basename, resolve } from 'path';
import { VSCODE_ROOT } from '../misc/constants';
import { isExists } from '../misc/fsUtil';

export async function listExtension(): Promise<string[]> {
	const base = resolve(VSCODE_ROOT, 'extensions.kendryte');
	
	const ret = [];
	const list = await readdir(base);
	for (const item of list) {
		const abs = resolve(base, item);
		if (await isExists(resolve(abs, 'package.json'))) {
			ret.push(basename(abs));
		}
	}
	return ret;
}