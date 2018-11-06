import { installDependency } from '../build-env/childprocess/yarn';
import { packWindows, reset_asar } from '../build-env/codeblocks/packWindows';
import { isWin, VSCODE_ROOT } from '../build-env/misc/constants';
import { lstat } from '../build-env/misc/fsUtil';
import { runMain, usePretty, whatIsThis } from '../build-env/misc/myBuildSystem';
import './prepare-release';

whatIsThis(__filename, 'install required thing for development (includes prepare-release).');

runMain(async () => {
	const output = usePretty();
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
});
