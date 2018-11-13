import { creatingZip } from '../build-env/codeblocks/zip';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'Re-create zip files from current compiled result.');

runMain(async () => {
	const output = usePretty('zip');
	await creatingZip(output);
	output.success('Done.');
});