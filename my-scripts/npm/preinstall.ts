if (process.env.BUILDING) {
	process.exit(0);
}

import { reset_asar } from '../build-env/codeblocks/packWindows';
import { usePretty } from '../build-env/misc/globalOutput';
import { runMain } from '../build-env/misc/myBuildSystem';

runMain(async () => {
	const output = usePretty();
	await reset_asar(output);
});
