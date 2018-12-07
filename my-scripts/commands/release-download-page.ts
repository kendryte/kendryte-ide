import { createIndexFileContent } from '../build-env/index-render';
import { initS3, OBJKEY_DOWNLOAD_INDEX, s3UploadBuffer } from '../build-env/misc/awsUtil';
import { globalLog } from '../build-env/misc/globalOutput';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Update the download page file on S3',
	'更新S3上的下载页',
);

runMain(async () => {
	const output = usePretty('create-download-index');
	
	await initS3(output);
	
	output.success('S3 init complete.');
	const indexData = await createIndexFileContent(output);
	
	globalLog('Upload index file: %s', OBJKEY_DOWNLOAD_INDEX);
	const upload = {
		stream: Buffer.from(indexData, 'utf8'),
		mime: 'text/html; charset=utf8',
	};
	await s3UploadBuffer(upload, OBJKEY_DOWNLOAD_INDEX);
	
	output.success('Done.');
});