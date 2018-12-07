import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { getExtensionPath } from '../build-env/bundled-extension/path';
import { pipeCommandOut } from '../build-env/childprocess/complex';
import { getElectronIfNot } from '../build-env/codeblocks/getElectron';
import { gulpCommands } from '../build-env/codeblocks/gulp';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { cleanScreen, getCleanableStdout } from '../build-env/misc/clsUtil';
import { isExists } from '../build-env/misc/fsUtil';
import { useThisStream } from '../build-env/misc/globalOutput';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { TypescriptCompileOutputStream } from '../build-env/misc/streamUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Start compile, for debugging',
	'编译代码，用于本地调试',
);

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	await getElectronIfNot();
	
	switchQuitKey();
	
	let skipped = false;
	if (process.argv.includes('--slow')
	    || !await isExists('extensions/css-language-features/client/out')
	    || !await isExists('data/extensions/kendryte-debug/gdb.js')
	) {
		const stream = usePretty('compile-extension');
		
		await buildExtension(stream, getExtensionPath(false), false);
		
		stream.write('starting compile extensions...');
		await pipeCommandOut(stream, 'node', ...gulpCommands(), 'compile-extensions');
		stream.success('extensions compiled');
		useThisStream(process.stderr);
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
