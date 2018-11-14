import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { cmp } from 'semver';
import { CURRENT_PLATFORM_TYPES } from '../codeblocks/zip.name';
import { RELEASE_ROOT } from '../misc/constants';
import { calcCompileFolderName, getPackageData, getProductData, isExists } from '../misc/fsUtil';
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
	const zips = CURRENT_PLATFORM_TYPES.map(fn => resolve(RELEASE_ROOT, fn));
	output.writeln('check build result zips exists:\n\t- %s' + zips.join('\n\t- '));
	const exists = await Promise.all(zips.map(isExists));
	if (exists.every(isTrue)) {
		const compiledResult = resolve(RELEASE_ROOT, await calcCompileFolderName());
		output.success('Build state is ok.');
	} else {
		output.writeln('no, something missing.');
		throw new Error('Not complete build process. please run `build` first.');
	}
}

function isTrue(b: boolean) {
	return b === true;
}