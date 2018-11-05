import { reset_asar } from '../build-env/codeblocks/packWindows';
import { runMain, usePretty } from '../build-env/misc/myBuildSystem';

runMain(async () => {
	const output = usePretty();
	await reset_asar(output);
});
