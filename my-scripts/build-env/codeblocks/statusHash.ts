import { createHash } from 'crypto';
import { resolve } from 'path';
import { RELEASE_ROOT } from '../misc/constants';
import { isExists, mkdirpSync, readFile, writeFile } from '../misc/fsUtil';

export function md5(buffer: Buffer|string): string {
	return createHash('md5').update(buffer).digest('hex');
}

export async function compareHash(id: string, value: string): Promise<boolean> {
	return (await readHash(id)) === value;
}

export function saveHash(id: string, value: string): Promise<void> {
	const hashDir = resolve(RELEASE_ROOT, 'hash');
	const hashFile = resolve(hashDir, id + '.md5');
	
	mkdirpSync(hashDir);
	return writeFile(hashFile, value);
}

async function readHash(id: string): Promise<string> {
	const hashFile = resolve(RELEASE_ROOT, 'hash', id + '.md5');
	if (await isExists(hashFile)) {
		return await readFile(hashFile);
	} else {
		return '';
	}
}