import { installDependency } from '../build-env/childprocess/yarn';
import { packWindows } from '../build-env/codeblocks/packWindows';
import { reset_asar } from '../build-env/codeblocks/resetAsar';
import { isWin, VSCODE_ROOT } from '../build-env/misc/constants';
import { lstat } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'install required thing for development (require prepare-release).');

runMain(async () => {
	chdir(VSCODE_ROOT);
	const output = usePretty('prepare-development');
	await installDependency(output);
	if (isWin) {
		const stat = await lstat('./node_modules');
		if (stat && stat.isDirectory()) {
			throw new Error('node_modules exists, must remove.');
		}
		await reset_asar(output);
		await packWindows(output);
	} else {
		// await installDependency(output, VSCODE_ROOT);
	}
	output.success('Done.');
});
