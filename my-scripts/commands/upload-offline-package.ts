import { platform } from 'os';
import { extname, resolve } from 'path';
import { releaseZipStorageFolder } from '../build-env/codeblocks/zip';
import {
	packageFileName,
	TYPE_LINUX_SFX,
	TYPE_LINUX_ZIP,
	TYPE_MAC_SFX,
	TYPE_MAC_ZIP,
	TYPE_WINDOWS_SFX,
	TYPE_WINDOWS_ZIP,
} from '../build-env/codeblocks/zip.name';
import { calcPackageAwsKey, initS3, s3UploadFile } from '../build-env/misc/awsUtil';
import { isMac, isWin, RELEASE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'zip files from ./data/packages to release dir.');

runMain(async () => {
	const output = usePretty('upload-offline-package');
	chdir(RELEASE_ROOT);
	
	await initS3(output);
	output.writeln('uploading to s3...');
	
	const types: string[] = [];
	if (isWin) {
		types.push(TYPE_WINDOWS_ZIP, TYPE_WINDOWS_SFX);
	} else if (isMac) {
		types.push(TYPE_MAC_ZIP, TYPE_MAC_SFX);
	} else {
		types.push(TYPE_LINUX_ZIP, TYPE_LINUX_SFX);
	}
	
	for (const type of types) {
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

function extMime(name) {
	switch (extname(name)) {
	case '.exe':
		return 'application/vnd.microsoft.portable-executable.';
	case '.bin':
		return 'application/x-executable';
	case '.zip':
		return 'application/zip';
	}
}