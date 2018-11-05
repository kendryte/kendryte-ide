import { startWorking } from '@gongt/stillalive';
import { pipeCommandOut } from '../build-env/childprocess/complex';
import { getElectronIfNot } from '../build-env/codeblocks/getElectron';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { cleanScreen, getCleanableStdout } from '../build-env/misc/clsUtil';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { isExists } from '../build-env/misc/fsUtil';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { TypescriptCompileOutputStream } from '../build-env/misc/streamUtil';

runMain(async () => {
	await getElectronIfNot();
	
	switchQuitKey();
	
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	
	chdir(VSCODE_ROOT);
	let skipped = false;
	if (process.argv.includes('--slow') || !await isExists('extensions/css-language-features/client/out')) {
		const stream = startWorking();
		stream.write('starting compile extensions...');
		await pipeCommandOut(stream, 'gulp', 'compile-extensions');
		stream.success('extensions compiled');
		stream.end();
	} else {
		skipped = true;
	}
	
	let streamToDisplay = getCleanableStdout();
	if (process.stderr.isTTY) {
		const outputParser = new TypescriptCompileOutputStream();
		outputParser.pipe(streamToDisplay);
		
		streamToDisplay = outputParser;
	}
	
	cleanScreen();
	if (skipped) {
		console.error('\x1B[38;5;14mExtensions Recompile Skipped, add \'--slow\' to force do it!\x1B[0m');
	}
	console.error('starting: gulp watch-client');
	await pipeCommandOut(streamToDisplay, 'node', '--max-old-space-size=4096', './node_modules/gulp/bin/gulp.js', '--', 'watch-client');
});
