import { readdir } from 'fs-extra';
import { basename, resolve } from 'path';
import { isExists } from '../misc/fsUtil';
import { getExtensionPath } from './path';

export async function listExtension(): Promise<string[]> {
	const {sourceRoot} = getExtensionPath(false);
	
	const ret = [];
	const list = await readdir(sourceRoot);
	for (const item of list) {
		const abs = resolve(sourceRoot, item);
		if (await isExists(resolve(abs, 'package.json'))) {
			ret.push(basename(abs));
		}
	}
	return ret;
}