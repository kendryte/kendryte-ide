import { creatingReleaseZip } from '../build-env/codeblocks/zip';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { timing } from '../build-env/misc/timeUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'Re-create zip files from current compiled result.');

runMain(async () => {
	const output = usePretty('zip');
	
	const timeZip = timing();
	output.log('Creating zip packages...');
	await creatingReleaseZip(output);
	output.success('Zip files created.' + timeZip());
	
	output.success('Done.');
});