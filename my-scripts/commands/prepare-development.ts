import { DuplexControl } from '@gongt/stillalive';
import { unlinkSync } from 'fs';
import { chdir } from '../build-env/childCommands';
import { isExists, isLink, isWin, runMain, thisIsABuildScript } from '../build-env/include';
import { installDependency, removeDirecotry, usePretty } from '../build-env/output';
import { packWindows } from '../build-env/packWindows';
// import './prepare-release'; // <---

thisIsABuildScript();

runMain(async () => {
	const output = usePretty();
	if (isWin) {
		await reset_asar(output);
		await packWindows(output);
	} else {
		await installDependency(output, process.env.VSCODE_ROOT);
	}
});

async function reset_asar(output: DuplexControl) {
	chdir(process.env.VSCODE_ROOT);
	if (await isLink('./node_modules')) {
		unlinkSync('./node_modules');
	}
	if (await isExists('./node_modules')) {
		throw new Error('node_modules exists, must remove.');
	}
	
	if (await isExists('./node_modules.asar')) {
		unlinkSync('./node_modules.asar');
	}
	if (await isExists('./node_modules.asar.unpacked')) {
		await removeDirecotry('./node_modules.asar.unpacked', output);
	}
	output.success('cleanup ASAR files.').continue();
}
