import { OutputStreamControl } from '@gongt/stillalive';
import { copy, mkdirp, unlink } from 'fs-extra';
import { resolve } from 'path';
import { removeDirectory } from '../codeblocks/removeDir';
import { VSCODE_ROOT } from '../misc/constants';
import { isExists, lstat } from '../misc/fsUtil';
import { listExtension } from './list';
import { getExtensionPath, IExtensionPath } from './path';

const myConfig = resolve(VSCODE_ROOT, 'my-scripts/tsconfig.json');

export async function prepareLinkForDev(output: OutputStreamControl) {
	const {targetRoot, sourceRoot} = getExtensionPath(false);
	for (const extName of await listExtension()) {
		output.writeln(extName + ':');
		const source = resolve(sourceRoot, extName);
		const target = resolve(targetRoot, extName);
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

export async function prepareLinkForProd(output: OutputStreamControl, {targetRoot, sourceRoot}: IExtensionPath) {
	for (const extName of await listExtension()) {
		output.writeln(extName + ':');
		const source = resolve(sourceRoot, extName);
		const target = resolve(targetRoot, extName);
		
		output.writeln(`   copy ${myConfig} to ${source}`);
		await copy(myConfig, resolve(source, 'tsconfig.json'));
		
		output.writeln(`   copy items from ${source} to ${target}`);
		await mkdirp(target);
		await copy(resolve(source, 'package.json'), resolve(target, 'package.json'));
		await copy(resolve(source, 'yarn.lock'), resolve(target, 'yarn.lock'));
	}
}