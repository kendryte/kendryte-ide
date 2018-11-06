import { DuplexControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { pipeCommandOut } from '../build-env/childprocess/complex';
import { installDependency } from '../build-env/childprocess/yarn';
import { extractSourceCodeIfNeed } from '../build-env/codeblocks/buildExtractSource';
import { createPosixSfx, createWindowsSfx, createWindowsZip } from '../build-env/codeblocks/zip';
import { isMac, isWin, RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { getProductData, isExists, mkdirpSync, removeDirectory, rename } from '../build-env/misc/fsUtil';
import { runMain, usePretty } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { timing } from '../build-env/misc/timeUtil';
import { linuxBuild } from '../build-env/posix/build-linux';
import { macBuild } from '../build-env/posix/mac/build-mac';
import { windowsBuild } from '../build-env/windows/build-windows';

let output: DuplexControl;
runMain(async () => {
	const output = usePretty();
	output.write('starting build...\n');
	
	chdir(VSCODE_ROOT);
	process.env.BUILDING = 'yes';
	
	const product = await getProductData();
	const distFolder = resolve(RELEASE_ROOT, product.PRODUCT_NAME);
	
	await cleanupBuildResult(distFolder);
	await extractSourceCodeIfNeed(output);
	await yarnInstall();
	await downloadElectron();
	
	const timeBuild = timing();
	output.success('Prepare complete. Start building package. This is really slow.').continue();
	
	let outputFolder: string;
	if (isWin) {
		outputFolder = await windowsBuild(output);
	} else if (isMac) {
		outputFolder = await macBuild(output);
	} else {
		outputFolder = await linuxBuild(output);
	}
	output.success('Package Created.' + timeBuild()).continue();
	
	await rename(outputFolder, distFolder);
	
	chdir(RELEASE_ROOT);
	const resultDir = resolve(RELEASE_ROOT, 'release');
	await cleanupZipFiles(resultDir);
	
	output.write('creating zip...');
	if (isWin) {
		await createWindowsSfx(output);
		await createWindowsZip(output);
	} else {
		await createPosixSfx(output);
	}
	
	output.success('complete.');
});

async function cleanupBuildResult(dir: string) {
	output.write(`build target is: ${dir}\n`);
	if (await isExists(dir)) {
		if (await isExists(dir + '.last')) {
			await removeDirectory(dir + '.last', output);
		}
		output.write(`remove last build result.\n`);
		
		await rename(dir, dir + '.last').catch((e) => {
			output.fail(`Cannot remove folder "${dir}", did you open any file in it?`).continue();
			throw e;
		});
	}
}

async function cleanupZipFiles(dir: string) {
	if (await isExists(dir)) {
		await removeDirectory(dir, output);
	}
	mkdirpSync(dir);
}

async function yarnInstall() {
	chdir(VSCODE_ROOT);
	const timeInstall = timing();
	await installDependency(output, VSCODE_ROOT);
	output.success('dependencies installed.' + timeInstall()).continue();
}

async function downloadElectron() {
	chdir(VSCODE_ROOT);
	output.write(`installing electron...\n`);
	await pipeCommandOut(output, 'gulp', 'electron-x64');
	output.success('electron installed.').continue();
}