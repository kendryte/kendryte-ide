import { OutputStreamControl } from '@gongt/stillalive';
import { platform } from 'os';
import { resolve } from 'path';
import { extMime } from '../codeblocks/extMime';
import { releaseZipStorageFolder } from '../codeblocks/zip';
import { CURRENT_PLATFORM_TYPES, releaseFileName } from '../codeblocks/zip.name';
import { calcReleaseFileAwsKey, s3UploadFile } from '../misc/awsUtil';
import { getPackageData, getProductData } from '../misc/fsUtil';
import { IDEJson, saveRemoteState, storeRemoteVersion, SYS_NAME } from './release.json';

export async function publishCompiledResult(output: OutputStreamControl, remote: IDEJson) {
	const packageJson = getPackageData();
	const prodData = getProductData();
	
	remote.version = `${packageJson.version}-${prodData.quality}`;
	storeRemoteVersion(remote, 'main', packageJson.version);
	
	output.writeln('uploading to s3...');
	
	if (!remote.allDownloads) {
		remote.allDownloads = {
			windows: [],
			linux: [],
			mac: [],
		};
	}
	const urlList = remote.allDownloads[SYS_NAME] = [];
	
	const plat = platform();
	const rType = CURRENT_PLATFORM_TYPES.slice().reverse(); // this put first -> remote[SYS_NAME]
	for (const type of rType) {
		const zipResult = resolve(releaseZipStorageFolder(), releaseFileName(plat, type));
		const s3Key = calcReleaseFileAwsKey(plat, type);
		
		const result = await s3UploadFile(output, s3Key, {
			stream: zipResult,
			mime: extMime(zipResult),
		});
		
		output.success(`uploaded ${type} to ${result}`);
		remote[SYS_NAME] = result;
		urlList.push(result);
	}
	
	output.writeln('saving IDE.json to AWS.');
	await saveRemoteState(remote);
}
