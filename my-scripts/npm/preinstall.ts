if (process.env.BUILDING) {
	console.error(' > preinstall: is BUILDING, skip.');
	process.exit(0);
}

import { reset_asar } from '../build-env/codeblocks/resetAsar';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';

runMain(async () => {
	const output = usePretty();
	await reset_asar(output);
});
