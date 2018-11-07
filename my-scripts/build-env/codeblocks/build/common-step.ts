import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { pipeCommandOut } from '../../childprocess/complex';
import { installDependency } from '../../childprocess/yarn';
import { ARCH_RELEASE_ROOT } from '../../misc/constants';
import { isExists, mkdirpSync, removeDirectory, rename, unlink } from '../../misc/fsUtil';
import { chdir } from '../../misc/pathUtil';
import { timing } from '../../misc/timeUtil';
import { gulpCommands } from '../gulp';

export async function cleanupBuildResult(output: OutputStreamControl, dir: string) {
	const backupDir = dir.replace(/(.app)$|$/, '.last$1');
	output.write(`build target is: ${dir}\n`);
	if (await isExists(dir)) {
		if (await isExists(backupDir)) {
			await removeDirectory(backupDir, output, false);
		}
		output.write(`remove last build result.\n`);
		
		await rename(dir, backupDir).catch((e) => {
			output.fail(`Cannot rename folder "${dir}", did you open any file in it?`).continue();
			throw e;
		});
	}
}

export async function cleanupZipFiles(output: NodeJS.WritableStream, dir: string) {
	if (await isExists(dir)) {
		await removeDirectory(dir, output);
	}
	mkdirpSync(dir);
}

export async function yarnInstall(output: OutputStreamControl) {
	const timeInstall = timing();
	
	const integrityFile = resolve(ARCH_RELEASE_ROOT, 'node_modules/.yarn-integrity');
	if (await isExists(integrityFile)) {
		await unlink(integrityFile);
	}
	await installDependency(output, ARCH_RELEASE_ROOT, false);
	output.success('dependencies installed.' + timeInstall()).continue();
}

export async function downloadElectron(output: OutputStreamControl) {
	chdir(ARCH_RELEASE_ROOT);
	output.write(`installing electron...\n`);
	await pipeCommandOut(output, 'node', ...gulpCommands(), 'electron-x64');
	output.success('electron installed.').continue();
}

export async function downloadBuiltinExtensions(output: OutputStreamControl) {
	chdir(ARCH_RELEASE_ROOT);
	output.write(`installing builtin extension...\n`);
	await pipeCommandOut(output, 'node', 'build/lib/builtInExtensions.js');
	output.success('builtin extension installed.').continue();
}
