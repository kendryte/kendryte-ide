import { installExtensionDevelopDeps, installExtensionProdDeps } from '../build-env/bundled-extension/installAll';
import { prepareLinkForDev } from '../build-env/bundled-extension/prepare';
import { installDependency } from '../build-env/childprocess/yarn';
import { packWindows } from '../build-env/codeblocks/packWindows';
import { reset_asar } from '../build-env/codeblocks/resetAsar';
import { isWin, VSCODE_ROOT } from '../build-env/misc/constants';
import { lstat } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'prepare required things for development.');

runMain(async () => {
	chdir(VSCODE_ROOT);
	const output = usePretty('install-dependency');
	output.writeln('installing dependencies');
	if (isWin) {
		output.writeln('is windows, use asar method.');
		const stat = await lstat('./node_modules');
		if (stat && stat.isDirectory()) {
			throw new Error('node_modules exists, must remove.');
		}
		await reset_asar(output);
		output.success('cleanup complete.');
		await packWindows(output);
		output.success('ASAR package created.');
	} else {
		output.writeln('is not windows, use native method.');
		await installDependency(output, VSCODE_ROOT);
		output.success('node packages installed.');
	}
	
	await installExtensionDevelopDeps(output, VSCODE_ROOT);
	output.success('extension dependencies installed.');
	await prepareLinkForDev(output);
	output.success('extension link created.');
	await installExtensionProdDeps(output, VSCODE_ROOT);
	output.success('Bundle extensions production dependencies resolved');
	
	output.success('Done.');
});
