import { resolve } from 'path';
import { initS3, OBJKEY_IDE_JSON, s3LoadText } from '../build-env/misc/awsUtil';
import { mkdirpSync } from '../build-env/misc/fsUtil';
import { globalInterruptLog } from '../build-env/misc/globalOutput';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'try to login to s3 with your default credentials.');

const {compress} = require('targz');

runMain(async () => {
	const awsdir = resolve(process.env.HOME, '.aws');
	mkdirpSync(awsdir);
	const output = usePretty();
	try {
		globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
		await initS3(output);
		
		await s3LoadText(OBJKEY_IDE_JSON);
		
		output.success('Done. Your config file all right.');
	} catch (e) {
		output.fail(e.message);
		output.empty().pause();
		console.log('Failed to download test file from aws. your config is not valid.');
		console.log('Place credentials and config file at %s');
		console.log('    see https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html');
		process.exit(1);
	}
});
