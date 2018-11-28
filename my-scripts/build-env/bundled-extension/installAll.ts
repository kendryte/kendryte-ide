import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { installDependency } from '../childprocess/yarn';
import { isExists, unlink } from '../misc/fsUtil';
import { listExtension } from './list';

export async function installExtensionDevelopDeps(output: OutputStreamControl, root: string) {
	output.writeln('installing all dependencies for kendryte extensions...');
	await installDependency(output, resolve(root, 'extensions.kendryte'));
	output.success('  base deps installed.');
	for (const extName of await listExtension()) {
		const path = resolve(root, 'extensions.kendryte', extName);
		output.writeln('  install for ' + path);
		await installDependency(output, path);
		output.success('  deps for ' + extName + ' installed.');
	}
}

export async function installExtensionProdDeps(output: OutputStreamControl, target: string) {
	output.writeln('installing production dependencies for kendryte extensions...');
	
	for (const extName of await listExtension()) {
		const distPath = resolve(target, 'data/extensions', extName);
		output.writeln('  install for ' + extName);
		await installDependency(output, distPath, {args: ['--production']});
		output.success('  deps for ' + extName + ' installed.');
		
		if (await isExists(resolve(distPath, 'yarn-install.log'))) {
			await unlink(resolve(distPath, 'yarn-install.log'));
		}
	}
}