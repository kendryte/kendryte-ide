import { OutputStreamControl } from '@gongt/stillalive';
import { platform } from 'os';
import { resolve } from 'path';
import { cmp } from 'semver';
import { releaseZipStorageFolder } from '../codeblocks/zip';
import { CURRENT_PLATFORM_TYPES, releaseFileName } from '../codeblocks/zip.name';
import { getPackageData, getProductData, isExists } from '../misc/fsUtil';
import { getRemoteVersion, IDEJson } from './release.json';

export async function checkBaseIsDifferent(remote: IDEJson) {
	const packData = getPackageData();
	const prodData = getProductData();
	
	const rv = getRemoteVersion(remote, 'main');
	if (rv && cmp(rv, '>', packData.version)) {
		throw new Error('run git pull now.');
	}
	
	return rv !== packData.version;
}

export async function checkPatchIsDifferent(remote: IDEJson) {
	const packData = getPackageData();
	const rv = getRemoteVersion(remote, 'patch');
	
	const r = parseFloat(rv);
	const l = parseFloat(packData.patchVersion);
	if (r > l) {
		throw new Error('run git pull now.');
	} else {
		return r !== l;
	}
}

export async function ensureBuildComplete(output: OutputStreamControl) {
	const zips = CURRENT_PLATFORM_TYPES.map(type => resolve(releaseZipStorageFolder(), releaseFileName(platform(), type)));
	output.writeln('check build result zips exists:\n\t- %s' + zips.join('\n\t- '));
	const exists = await Promise.all(zips.map(isExists));
	if (exists.every(isTrue)) {
		output.success('Build state is ok.');
	} else {
		output.writeln('no, something missing.');
		
		output.warn('these files must exists: \n\t- ' + zips.join('\n\t- '));
		throw new Error('Not complete build process. please run `build` first.');
	}
}

function isTrue(b: boolean) {
	return b === true;
}