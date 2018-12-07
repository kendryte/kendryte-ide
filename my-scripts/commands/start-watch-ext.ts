import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { getExtensionPath } from '../build-env/bundled-extension/path';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';

whatIsThis(
	'Start compile `kendryte.extensions` projects in watch mode',
	'监视模式编译 `kendryte.extensions` 里的项目',
);

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	
	switchQuitKey();
	
	await buildExtension(process.stderr, getExtensionPath(false), true);
});
