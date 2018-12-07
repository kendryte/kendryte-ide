import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { getExtensionPath } from '../build-env/bundled-extension/path';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';

whatIsThis(
	'Compile private extensions',
	'编译私有插件',
);

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	
	switchQuitKey();
	
	await buildExtension(process.stderr, getExtensionPath(false), true);
});
