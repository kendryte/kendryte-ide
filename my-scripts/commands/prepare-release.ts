import { resolve } from 'path';
import { shellExec } from '../build-env/childprocess/noDependency';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { lstat, mkdirpSync, removeDirectory, writeFile } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

whatIsThis(__filename, 'install required thing for create release.');

runMain(async () => {
	chdir(VSCODE_ROOT + '/my-scripts');
	shellExec('yarn', 'install');
	shellExec('tsc', '-p', '.');
});

async function removeYarnGlobalDir(binDir: string, resolveTo?: string) {
	if (!binDir) {
		return;
	}
	if (resolveTo) {
		binDir = resolve(binDir, resolveTo);
	}
	
	const stat = await lstat(binDir);
	if (stat) {
		if (stat.isDirectory()) {
			await removeDirectory(binDir, process.stderr);
		}
	} else {
		mkdirpSync(resolve(binDir, '..'));
	}
	await writeDummy(binDir);
}

function writeDummy(bin) {
	return writeFile(bin, '@this is a dummy file from kendryte-ide. To prevent yarn add broken global bin link here.');
}
