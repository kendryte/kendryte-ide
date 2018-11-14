import { initS3, OBJKEY_IDE_JSON, s3LoadText } from '../build-env/misc/awsUtil';
import { globalInterruptLog } from '../build-env/misc/globalOutput';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'try to login to s3 with your default credentials.');

const {compress} = require('targz');

runMain(async () => {
	try {
		const output = usePretty();
		globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
		await initS3(output);
		
		await s3LoadText(OBJKEY_IDE_JSON);
		
		output.success('Done. Your config file all right.');
	} catch (e) {
		console.error(e.message);
		console.log('Failed to download test file from aws. your config is not valid.');
		process.exit(1);
	}
});
