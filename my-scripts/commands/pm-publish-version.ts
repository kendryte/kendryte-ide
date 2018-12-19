import { OutputStreamControl } from '@gongt/stillalive';
import { createReadStream } from 'fs';
import { lstat, readdir } from 'fs-extra';
import { basename, resolve } from 'path';
import { extMime } from '../build-env/codeblocks/extMime';
import { removeDirectory } from '../build-env/codeblocks/removeDir';
import {
	calcLibraryFileAwsKey,
	initS3,
	OBJKEY_PACKAGE_MANAGER_EXAMPLE,
	OBJKEY_PACKAGE_MANAGER_LIBRARY,
	s3LoadJson,
	s3UploadJson,
	s3UploadStream,
} from '../build-env/misc/awsUtil';
import { RELEASE_ROOT } from '../build-env/misc/constants';
import { isExists } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';
import { readPackageInfo } from '../build-env/package-manager/packageInfo';
import { ICompileOptions, IPackageVersionDetail, IRemotePackageInfo, IRemotePackageRegistry } from '../build-env/package-manager/type';

const {compress} = require('targz');

whatIsThis(
	'Publish examples or libraries in package-manager folder',
	'从 package-manager 文件夹发布依赖或样例程序',
);

runMain(async () => {
	const projects = process.argv.slice(2);
	const pmPath = resolve(RELEASE_ROOT, 'package-manager');
	console.error('Package Manager Repo: %s.', pmPath);
	if (!projects.length) {
		console.error('Please select project to publish: \n');
		let max = 0;
		const arr = [];
		for (const item of await readdir(pmPath)) {
			if ((await lstat(resolve(pmPath, item))).isDirectory()) {
				arr.push(item);
				max = Math.max(max, item.length);
			}
		}
		max += 4;
		const eachLine = Math.floor(((process.stderr.columns || 80) - 2) / max) || 1;
		for (const line of chunk(arr, eachLine)) {
			console.error('  ' + line.map(l => pad(l, max)).join(''));
		}
		throw new Error('At least 1 argument required.');
	}
	const output = usePretty('library-publish-version');
	
	await initS3(output);
	
	const TODO: [string, IRemotePackageInfo, ICompileOptions][] = [];
	const remoteLib = await s3LoadJson<IRemotePackageRegistry>(OBJKEY_PACKAGE_MANAGER_LIBRARY);
	const remoteExp = await s3LoadJson<IRemotePackageRegistry>(OBJKEY_PACKAGE_MANAGER_EXAMPLE);
	
	function switchRemote(data: ICompileOptions) {
		if (data.type === 'library') {
			return remoteLib;
		} else if (data.type === 'example') {
			return remoteExp;
		} else {
			throw new Error(`package has no type: ${data.name}`);
		}
	}
	
	for (const project of projects) {
		const packRoot = resolve(pmPath, project);
		if (!await isExists(packRoot)) {
			throw new Error('Dir ' + packRoot + ' does not exists.');
		}
		
		const data = await readPackageInfo(output, packRoot);
		const remoteInfo = findRegisterPackage(switchRemote(data), data);
		
		const zipFile = await createTarball(output, packRoot);
		
		output.writeln(data.name + ' : ' + data.version);
		
		const key = calcLibraryFileAwsKey(data);
		const downloadUrl = await s3UploadStream(output, {
			stream: createReadStream(zipFile),
			mime: extMime(key),
		}, key);
		
		const versionInfo = findCreateVersion(remoteInfo, data.version);
		versionInfo.downloadUrl = downloadUrl;
		versionInfo.releaseDate = (new Date()).toUTCString();
		output.success(data.name + ': OK!');
	}
	
	output.writeln('upload registry...');
	await s3UploadJson(remoteLib, OBJKEY_PACKAGE_MANAGER_LIBRARY);
	await s3UploadJson(remoteExp, OBJKEY_PACKAGE_MANAGER_EXAMPLE);
	
	output.success('Done.').pause();
});

function findRegisterPackage(remote: IRemotePackageRegistry, data: ICompileOptions): IRemotePackageInfo {
	const found = remote.find(e => e.name === data.name);
	if (found) {
		return found;
	}
	
	const newPkg = {
		name: data.name,
		icon: data.icon,
		description: data.description,
		homepage: data.homepage,
		versions: [],
		type: data.type,
	};
	remote.push(newPkg);
	return newPkg;
}

function findCreateVersion(packInfo: IRemotePackageInfo, version: string): IPackageVersionDetail {
	const found = packInfo.versions.find(e => e.versionName === version);
	if (found) {
		return found;
	}
	
	const ret = {
		versionName: version,
	} as any;
	packInfo.versions.push(ret);
	
	return ret;
}

async function createTarball(output: OutputStreamControl, packRoot: string) {
	const name = basename(packRoot, '.git');
	output.writeln('create tarball for ' + name);
	const tempFile = resolve(process.env.TEMP, `${name}.tgz`);
	await removeDirectory(tempFile, output);
	await new Promise((resolve, reject) => {
		output.writeln('create tarball from ' + process.cwd());
		const wrappedCallback = (err) => err? reject(err) : resolve();
		
		const config = {
			src: './',
			dest: tempFile,
			tar: {
				dmode: 493, // 0755
				fmode: 420, // 0644
				strict: true,
				ignore(name) {
					return /^\.|\/\./.test(name);
				},
			},
			gz: {
				level: 6,
				memLevel: 6,
			},
		};
		
		chdir(packRoot);
		compress(config, wrappedCallback);
	});
	output.writeln('created file: ' + tempFile);
	return tempFile;
}

function chunk<T>(arr: Array<T>, chunkSize: number): Array<Array<T>> {
	return arr.reduce((prevVal: any, currVal: any, currIndx: number, array: Array<T>) =>
		!(currIndx % chunkSize)? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)]) : prevVal, []);
}

function pad(s: string, len: number) {
	return s + Buffer.alloc(len - s.length, ' ').toString();
}