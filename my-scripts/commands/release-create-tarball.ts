import { creatingReleaseZip } from '../build-env/codeblocks/zip';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { timing } from '../build-env/misc/timeUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'(re-)Create 7z files from last compiled result',
	'从上次编译的结果（重新）创建7z压缩包',
);

runMain(async () => {
	const output = usePretty('zip');
	
	const timeZip = timing();
	output.log('Creating zip packages...');
	await creatingReleaseZip(output);
	output.success('Zip files created.' + timeZip());
	
	output.success('Done.');
});