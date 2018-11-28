import { OutputStreamControl } from '@gongt/stillalive';
import { copy, mkdirp, symlink, unlink } from 'fs-extra';
import { resolve } from 'path';
import { removeDirectory } from '../codeblocks/removeDir';
import { ARCH_RELEASE_ROOT, VSCODE_ROOT } from '../misc/constants';
import { isExists, lstat } from '../misc/fsUtil';
import { listExtension } from './list';

const myConfig = resolve(VSCODE_ROOT, 'my-scripts/tsconfig.json');

export async function prepareLinkForDev(output: OutputStreamControl) {
	for (const extName of await listExtension()) {
		const source = resolve(VSCODE_ROOT, 'extensions.kendryte', extName);
		const target = resolve(VSCODE_ROOT, 'data/extensions', extName);
		if (await isExists(target)) {
			const stat = await lstat(target);
			if (stat.isSymbolicLink()) {
				await unlink(target);
			} else {
				await removeDirectory(target, output);
			}
		}
		
		await symlink(myConfig, resolve(source, 'tsconfig.json'));
		
		await mkdirp(target);
		await symlink(resolve(source, 'package.json'), resolve(target, 'package.json'));
		await symlink(resolve(source, 'yarn.lock'), resolve(target, 'yarn.lock'));
	}
}

export async function prepareLinkForProd(output: OutputStreamControl) {
	for (const extName of await listExtension()) {
		const source = resolve(VSCODE_ROOT, 'extensions.kendryte', extName);
		const target = resolve(ARCH_RELEASE_ROOT, 'data/extensions', extName);
		
		await copy(myConfig, resolve(source, 'tsconfig.json'));
		
		await mkdirp(target);
		await copy(resolve(source, 'package.json'), resolve(target, 'package.json'));
		await copy(resolve(source, 'yarn.lock'), resolve(target, 'yarn.lock'));
	}
}