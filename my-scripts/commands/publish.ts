import { OutputStreamControl } from '@gongt/stillalive';
import { S3 } from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/s3';
import { createReadStream } from 'fs';
import { copy } from 'fs-extra';
import { platform } from 'os';
import { basename, resolve } from 'path';
import { resolve as resolveUrl } from 'url';
import { format, promisify } from 'util';
import { getOutputCommand, pipeCommandOut } from '../build-env/childprocess/complex';
import { downloadFile } from '../build-env/codeblocks/downloadFile';
import { un7zip } from '../build-env/codeblocks/zip';
import { calcReleaseFileName } from '../build-env/codeblocks/zip.name';
import { isMac, isWin, RELEASE_ROOT } from '../build-env/misc/constants';
import { calcCompileFolderName, getPackageData, getProductData, isExists } from '../build-env/misc/fsUtil';
import { globalInterruptLog } from '../build-env/misc/globalOutput';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { CollectingStream } from '../build-env/misc/streamUtil';
import { timeout } from '../build-env/misc/timeUtil';
import { usePretty } from '../build-env/misc/usePretty';
import { IDEJson, IDEPatchJson } from '../publisher/release.json';

const {compress} = require('targz');

const {loadCredentialsFromEnv, loadCredentialsFromIniFile, loadRegionFromEnv, loadRegionFromIniFile} = require('awscred');
require('awscred').credentialsCallChain = [loadCredentialsFromEnv, loadCredentialsFromIniFile];
require('awscred').regionCallChain = [loadRegionFromEnv, loadRegionFromIniFile];
const loadCredentialsAndRegion = promisify(require('awscred').loadCredentialsAndRegion);

const OBJKEY_IDE_JSON = 'release/IDE.json';

runMain(async () => {
	const output = usePretty('publish');
	
	globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
	
	const compiledResult = resolve(RELEASE_ROOT, await calcCompileFolderName());
	const targetZipFiles = (await calcReleaseFileName()).map(fn => resolve(RELEASE_ROOT, fn));
	if (await isExists(compiledResult)) {
		globalInterruptLog('read data from ' + compiledResult);
	} else {
		globalInterruptLog('read data from ' + targetZipFiles[0]);
		await un7zip(output, targetZipFiles[0], RELEASE_ROOT);
	}
	
	const prodData = await getProductData(resolve(compiledResult, 'resources/app'));
	const packData = await getPackageData(resolve(compiledResult, 'resources/app'));
	
	const awsConfig = await loadCred(output, process.env.HOME) || await loadCred(output, process.env.ORIGINAL_HOME);
	if (!awsConfig) {
		throw new Error('Not able to load AWS config. see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html');
	}
	const s3 = new S3({
		...awsConfig,
		
		logger: {
			write: output.write.bind(output),
			log(...messages: any[]) {
				output.writeln((format as any)(...messages));
			},
		},
	});
	
	const Bucket = prodData.applicationName;
	const patchVersionStr = packData.patchVersion.toString();
	
	output.writeln('loading IDE.json from AWS.');
	const json = await s3.getObject({Bucket, Key: OBJKEY_IDE_JSON})
	                     .createReadStream()
	                     .pipe(new CollectingStream(), {end: true})
	                     .promise();
	const ideState: IDEJson = JSON.parse(json);
	if (!ideState.patches) {
		ideState.patches = [];
	}
	
	let lastPatch: IDEPatchJson = (ideState.patches || []).find((item) => {
		return (item.version || '').toString() === patchVersionStr;
	}) || {} as any;
	output.writeln(`remote version=${ideState.version} patch=${lastPatch.version || 'Null'}`);
	output.writeln(`local  version=${packData.version} patch=${patchVersionStr}`);
	
	if (ideState.version === packData.version || ideState.version === `${packData.version}-${prodData.quality}`) {
		output.writeln('ide version has not change: ' + ideState.version);
		
		const alreadyPost = lastPatch.version === patchVersionStr && lastPatch[platformKey()];
		if (alreadyPost) {
			output.success('already published same version');
			await timeout(1000);
		} else {
			await publishSubVersion();
		}
	} else {
		await publishMainVersion();
	}
	
	async function publishSubVersion() {
		output.writeln('publishing sub version: ' + packData.patchVersion);
		if (!lastPatch.version) { // no current patch
			lastPatch.version = patchVersionStr;
			ideState.patches.push(lastPatch);
		}
		
		const oldPackageAt = resolveUrl(bucketUrl(Bucket, OBJKEY_IDE_JSON), ideState[platformKey()]);
		const oldPackageLocal = resolve(RELEASE_ROOT, 'create-patch', 'old.7z');
		output.writeln('download old version from: ' + oldPackageAt);
		await downloadFile(output, oldPackageAt, oldPackageLocal);
		output.success('downloaded old version.');
		output.writeln('extract it');
		await un7zip(output, oldPackageLocal, resolve(RELEASE_ROOT, 'create-patch', 'prev-version'));
		output.success('extract complete.');
		
		for (const file of targetZipFiles) {
			ideState[platformKey()] = await new Promise<string>((resolve, reject) => {
				s3.upload(
					{ACL: 'public-read', Bucket, Key: 'release/download/' + basename(file), Body: createReadStream(file)},
					{partSize: 10 * 1024 * 1024, queueSize: 4},
					(err, data) => err? reject(err) : resolve(data.Location),
				);
			});
		}
		
		const createdPatchTarball = await createPatch(output, resolve(RELEASE_ROOT, 'create-patch', 'prev-version'), compiledResult);
		const patchUrl = await new Promise<string>((resolve, reject) => {
			s3.upload(
				{ACL: 'public-read', Bucket, Key: 'release/patches/' + basename(createdPatchTarball)},
				{partSize: 10 * 1024 * 1024, queueSize: 4},
				(err, data) => err? reject(err) : resolve(data.Location),
			);
		});
		
		lastPatch[platformKey()] = {
			generic: patchUrl,
		};
		
	}
	
	async function publishMainVersion() {
		output.writeln('publishing main version: ' + packData.version);
	}
	
	output.writeln('Done.');
});

async function createPatch(output: OutputStreamControl, baseVer: string, newVer: string) {
	baseVer = resolve(baseVer, 'resources/app');
	newVer = resolve(newVer, 'resources/app');
	chdir(baseVer);
	await pipeCommandOut(output, 'git', 'init', '.');
	await pipeCommandOut(output.screen, 'git', 'add', '.');
	await pipeCommandOut(output.screen, 'git', 'commit', '-m', 'init');
	await copy(newVer, baseVer);
	await pipeCommandOut(output.screen, 'git', 'commit', '-m', 'init');
	await pipeCommandOut(output.screen, 'git', 'add', '.');
	const fileList = await getOutputCommand('git', 'diff', '--name-only', 'HEAD');
	const realFileList = fileList.split('\n').filter((e) => {
		return e && !e.startsWith('node_modules');
	});
	
	const packData = await getPackageData(baseVer);
	
	const patchFile = resolve(RELEASE_ROOT, 'release-files', `${packData.version}_${packData.patchVersion}_${platform()}.tar.gz`);
	const config = {
		src: baseVer,
		dest: patchFile,
		tar: {
			entries: realFileList,
			dmode: 493, // 0755
			fmode: 420, // 0644
			strict: false,
		},
		gz: {
			level: 6,
			memLevel: 6,
		},
	};
	await new Promise((resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : resolve();
		compress(config, wrappedCallback);
	});
	
	return patchFile;
}

function platformKey() {
	if (isWin) {
		return 'windows';
	} else if (isMac) {
		return 'mac';
	} else {
		return 'linux';
	}
}

async function loadCred(output: OutputStreamControl, home: string): Promise<Partial<ClientConfiguration>> {
	output.writeln('try load aws key from ' + home);
	const saveHome = process.env.HOME;
	process.env.HOME = home;
	const p = loadCredentialsAndRegion();
	process.env.HOME = saveHome;
	return p.then((cfg) => {
		if (cfg) {
			output.success('success load config from ' + home);
		}
		return cfg;
	}, () => {
		output.writeln('not able to load.');
		return null;
	});
}

function bucketUrl(Bucket: string, Key: string) {
	return `https://s3.cn-northwest-1.amazonaws.com.cn/${Bucket}/${Key}`;
}