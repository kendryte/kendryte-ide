import { isWin, lstat, runMain, thisIsABuildScript, VSCODE_ROOT } from '../build-env/include';
import { installDependency, usePretty } from '../build-env/output';
import { packWindows, reset_asar } from '../build-env/packWindows';
import './prepare-release';

thisIsABuildScript();

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
