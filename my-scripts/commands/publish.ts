import { OutputStreamControl } from '@gongt/stillalive';
import { platform } from 'os';
import { extMime } from '../build-env/codeblocks/extMime';
import { calcPatchFileAwsKey, initS3, OBJKEY_DOWNLOAD_INDEX, s3UploadFile, s3WebsiteUrl } from '../build-env/misc/awsUtil';
import { getPackageData } from '../build-env/misc/fsUtil';
import { globalInterruptLog } from '../build-env/misc/globalOutput';
import { runMain } from '../build-env/misc/myBuildSystem';
import { usePretty } from '../build-env/misc/usePretty';
import { checkBaseIsDifferent, checkPatchIsDifferent, ensureBuildComplete } from '../build-env/publisher/checkVersions';
import { createPatch } from '../build-env/publisher/createPatch';
import { publishCompiledResult } from '../build-env/publisher/publishCompiledResult';
import {
	ensurePatchData,
	getRemoteVersion,
	IDEJson,
	loadRemoteState,
	saveRemoteState,
	storeRemoteVersion,
	SYS_NAME,
} from '../build-env/publisher/release.json';

runMain(async () => {
	const output = usePretty('publish');
	
	await ensureBuildComplete(output);
	
	globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
	await initS3(output);
	
	const packData = await getPackageData();
	
	output.writeln('loading IDE.json from AWS.');
	let load = loadRemoteState();
	if (process.argv.includes('-f')) {
		output.writeln('    force argument detected. add try-catch to load.');
		load = load.catch((e) => {
			output.fail('Not able to load state from aws. but --force is set, will create brand new release.');
			return {
				version: '0.0.0',
				homepageUrl: s3WebsiteUrl(OBJKEY_DOWNLOAD_INDEX),
				patches: [],
			} as any as IDEJson;
		});
	} else {
		load.then(() => {
			output.success('loaded version data:');
		});
	}
	const remote = await load;
	output.log(
		`  remote version=%s patch=%s\n  local  version=%s patch=%s`,
		getRemoteVersion(remote, 'main') || 'Null',
		getRemoteVersion(remote, 'patch') || 'Null',
		packData.version || 'Null',
		packData.patchVersion || 'Null',
	);
	
	if (await checkBaseIsDifferent(remote)) {
		output.writeln('base version has changed, publish new version.');
		remote.patches = [];
		await publishCompiledResult(output, remote);
	} else if (await checkPatchIsDifferent(remote)) {
		output.writeln('base version unchanged, but patch version changed, publish new patch.');
		await createAndPublishPatch(output, remote);
		
		await publishCompiledResult(output, remote);
	} else {
		output.success('Done. Everything is up to date.');
		return;
	}
	
	output.writeln('Done.');
});

async function createAndPublishPatch(output: OutputStreamControl, remote: IDEJson) {
	const packageJson = getPackageData();
	storeRemoteVersion(remote, 'patch', packageJson.patchVersion);
	
	const patchFile = await createPatch(output, remote);
	
	const key = calcPatchFileAwsKey(platform());
	const patchUrl = await s3UploadFile(
		output,
		key,
		{stream: patchFile, mime: extMime(patchFile)},
	);
	
	const data = ensurePatchData(packageJson.patchVersion, remote);
	data[SYS_NAME].generic = patchFile;
	
	output.writeln('saving IDE.json to AWS.');
	await saveRemoteState(remote);
}
