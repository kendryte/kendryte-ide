import { runMain } from '../build-env/include';
import { usePretty } from '../build-env/output';
import { reset_asar } from '../build-env/packWindows';

runMain(async () => {
	const output = usePretty();
	await reset_asar(output);
});
