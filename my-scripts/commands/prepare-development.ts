import { resolve } from 'path';
import { installDependency } from '../build-env/childprocess/yarn';
import { packWindows } from '../build-env/codeblocks/packWindows';
import { reset_asar } from '../build-env/codeblocks/resetAsar';
import { isWin, RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { lstat } from '../build-env/misc/fsUtil';
import { usePretty } from '../build-env/misc/globalOutput';
import { whatIsThis } from '../build-env/misc/help';
import { runMain, useWriteFileStream } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import './prepare-release';

whatIsThis(__filename, 'install required thing for development (require prepare-release).');

runMain(async () => {
	chdir(VSCODE_ROOT);
	const output = usePretty();
	output.pipe(useWriteFileStream(resolve(RELEASE_ROOT, 'prepare-development.log')));
	if (isWin) {
		const stat = await lstat('./node_modules');
		if (stat && stat.isDirectory()) {
			throw new Error('node_modules exists, must remove.');
		}
		await reset_asar(output);
		await packWindows(output);
	} else {
		await installDependency(output, VSCODE_ROOT);
	}
	output.success('Done.');
});
