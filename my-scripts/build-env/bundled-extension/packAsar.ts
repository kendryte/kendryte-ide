import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { pipeCommandOut } from '../childprocess/complex';
import { gulpCommands } from '../codeblocks/gulp';
import { removeDirectory } from '../codeblocks/removeDir';
import { VSCODE_ROOT } from '../misc/constants';
import { chdir } from '../misc/pathUtil';
import { installExtensionProdDeps } from './installAll';
import { listExtension } from './list';

export async function packExtensionModules(output: OutputStreamControl, target: string) {
	await installExtensionProdDeps(output, target);
	for (const extName of await listExtension()) {
		const resultDir = resolve(target, 'data/extensions', extName);
		chdir(resultDir);
		process.env.PACK_TARGET = resultDir;
		await pipeCommandOut(
			output, 'node', ...gulpCommands(target), '--gulpfile', resolve(VSCODE_ROOT, 'my-scripts/gulpfile/pack-ext.js'),
		);
		output.writeln('    packed ' + extName + ' deps.');
		
		await removeDirectory(resolve(resultDir, 'node_modules'), output);
	}
}