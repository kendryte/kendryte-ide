import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';

whatIsThis(__filename, 'compile extensions');

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	
	switchQuitKey();
	
	await buildExtension(process.stderr, VSCODE_ROOT, VSCODE_ROOT, true);
});
