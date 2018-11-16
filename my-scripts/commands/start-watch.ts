import { startWorking } from '@gongt/stillalive';
import { pipeCommandOut } from '../build-env/childprocess/complex';
import { getElectronIfNot } from '../build-env/codeblocks/getElectron';
import { gulpCommands } from '../build-env/codeblocks/gulp';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { cleanScreen, getCleanableStdout } from '../build-env/misc/clsUtil';
import { isExists } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { TypescriptCompileOutputStream } from '../build-env/misc/streamUtil';

whatIsThis(__filename, 'start local debug IDE, require prepare-development first.');

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	await getElectronIfNot();

	switchQuitKey();

	let skipped = false;
	if (process.argv.includes('--slow') || !await isExists('extensions/css-language-features/client/out')) {
		const stream = startWorking();
		stream.write('starting compile extensions...');
		await pipeCommandOut(stream, 'node', ...gulpCommands(), 'compile-extensions');
		stream.success('extensions compiled');
		stream.end();
	} else {
		skipped = true;
	}

	let streamToDisplay = process.stdout;
	if (process.stdout.isTTY) {
		streamToDisplay = new TypescriptCompileOutputStream();
		streamToDisplay.pipe(getCleanableStdout());
		cleanScreen();
	}

	if (skipped) {
		console.error('\x1B[38;5;14mExtensions Recompile Skipped, add \'--slow\' to force do it!\x1B[0m');
	}

	console.error('starting: gulp watch-client');
	await pipeCommandOut(streamToDisplay, 'node', ...gulpCommands(), 'watch-client');
});
