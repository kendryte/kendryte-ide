import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { installDependency } from '../childprocess/yarn';
import { isExists, unlink } from '../misc/fsUtil';
import { listExtension } from './list';
import { IExtensionPath } from './path';

export async function installExtensionDevelopDeps(output: OutputStreamControl, {sourceRoot}: Pick<IExtensionPath, 'sourceRoot'>) {
	output.writeln('installing all dependencies for kendryte extensions...');
	await installDependency(output, sourceRoot);
	output.success('  base deps installed.');
	for (const extName of await listExtension()) {
		const path = resolve(sourceRoot, extName);
		output.writeln('  install for ' + path);
		await installDependency(output, path);
		output.success('  deps for ' + extName + ' installed.');
	}
}

export async function installExtensionProdDeps(output: OutputStreamControl, {targetRoot}: Pick<IExtensionPath, 'targetRoot'>) {
	output.writeln('installing production dependencies for kendryte extensions...');
	
	for (const extName of await listExtension()) {
		const distPath = resolve(targetRoot, extName);
		output.writeln('  install for ' + extName);
		await installDependency(output, distPath, {args: ['--production']});
		output.success('  deps for ' + extName + ' installed.');
		
		if (await isExists(resolve(distPath, 'yarn-install.log'))) {
			await unlink(resolve(distPath, 'yarn-install.log'));
		}
	}
}