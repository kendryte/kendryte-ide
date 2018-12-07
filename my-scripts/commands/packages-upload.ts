import { platform } from 'os';
import { resolve } from 'path';
import { extMime } from '../build-env/codeblocks/extMime';
import { releaseZipStorageFolder } from '../build-env/codeblocks/zip';
import { CURRENT_PLATFORM_TYPES, packageFileName } from '../build-env/codeblocks/zip.name';
import { calcPackageAwsKey, initS3, s3UploadFile } from '../build-env/misc/awsUtil';
import { RELEASE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Upload created Offline.Dependency.Package to S3',
	'将创建的离线依赖包上传到S3',
);

runMain(async () => {
	const output = usePretty('upload-offline-package');
	chdir(RELEASE_ROOT);
	
	await initS3(output);
	output.writeln('uploading to s3...');
	
	for (const type of CURRENT_PLATFORM_TYPES) {
		const zipResult = resolve(releaseZipStorageFolder(), packageFileName(platform(), type));
		const s3Key = calcPackageAwsKey(platform(), type);
		
		await s3UploadFile(output, s3Key, {
			stream: zipResult,
			mime: extMime(zipResult),
		});
		
		output.writeln('---------------');
	}
	
	output.success('Done. you may run create-download-index now.');
});
