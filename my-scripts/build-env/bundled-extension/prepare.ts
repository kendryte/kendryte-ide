import { OutputStreamControl } from '@gongt/stillalive';
import { copy, mkdirp, unlink } from 'fs-extra';
import { resolve } from 'path';
import { removeDirectory } from '../codeblocks/removeDir';
import { ARCH_RELEASE_ROOT, VSCODE_ROOT } from '../misc/constants';
import { isExists, lstat } from '../misc/fsUtil';
import { listExtension } from './list';

const myConfig = resolve(VSCODE_ROOT, 'my-scripts/tsconfig.json');

export async function prepareLinkForDev(output: OutputStreamControl) {
	for (const extName of await listExtension()) {
		output.writeln(extName + ':');
		const source = resolve(VSCODE_ROOT, 'extensions.kendryte', extName);
		const target = resolve(VSCODE_ROOT, 'data/extensions', extName);
		if (await isExists(target)) {
			output.writeln('   remove target');
			const stat = await lstat(target);
			if (stat.isSymbolicLink()) {
				await unlink(target);
			} else {
				await removeDirectory(target, output);
			}
		}
		
		const jsconfigFile = resolve(source, 'tsconfig.json');
		if (await isExists(jsconfigFile)) {
			output.writeln('   remove ${jsconfigFile}');
			await unlink(jsconfigFile);
		}
		
		output.writeln(`   copy ${myConfig} to ${source}`);
		await copy(myConfig, jsconfigFile);
		
		output.writeln(`   copy items from ${source} to ${target}`);
		await mkdirp(target);
		await copy(resolve(source, 'package.json'), resolve(target, 'package.json'));
		await copy(resolve(source, 'yarn.lock'), resolve(target, 'yarn.lock'));
	}
}

export async function prepareLinkForProd(output: OutputStreamControl, distDIr: string) {
	for (const extName of await listExtension()) {
		output.writeln(extName + ':');
		const source = resolve(ARCH_RELEASE_ROOT, 'extensions.kendryte', extName);
		const target = resolve(distDIr, 'data/extensions', extName);
		
		output.writeln(`   copy ${myConfig} to ${source}`);
		await copy(myConfig, resolve(source, 'tsconfig.json'));
		
		output.writeln(`   copy items from ${source} to ${target}`);
		await mkdirp(target);
		await copy(resolve(source, 'package.json'), resolve(target, 'package.json'));
		await copy(resolve(source, 'yarn.lock'), resolve(target, 'yarn.lock'));
	}
}