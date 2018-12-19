import { OBJKEY_DOWNLOAD_INDEX, OBJKEY_IDE_JSON, s3LoadJson, s3UploadJson, s3WebsiteUrl } from '../misc/awsUtil';
import { isMac, isWin } from '../misc/constants';

export interface IDEJson {
	version: string;
	homepageUrl: string;
	_autoUpdateVersions: {
		windows: {main: string; patch: string;};
		mac: {main: string; patch: string;};
		linux: {main: string; patch: string;};
	},
	patches: IDEPatchJson[];
	linux: string;
	mac: string;
	windows: string;
	allDownloads: {
		linux: string[];
		mac: string[];
		windows: string[];
	};
}

export interface IDEPatchJson {
	linux: {generic: string};
	mac: {generic: string};
	version: string;
	windows: {generic: string};
}

export function storeRemoteVersion(remote: IDEJson, type: 'main'|'patch', ver: string) {
	if (!remote._autoUpdateVersions[SYS_NAME]) {
		remote._autoUpdateVersions[SYS_NAME] = {} as any;
	}
	remote._autoUpdateVersions[SYS_NAME][type] = ver;
}

export function makeNewRemote(): IDEJson {
	return {
		version: '0.0.0',
		homepageUrl: s3WebsiteUrl(OBJKEY_DOWNLOAD_INDEX),
		patches: [],
		_autoUpdateVersions: {},
	} as any;
}

export function getRemoteVersion(remote: IDEJson, type: 'main'|'patch') {
	if (!remote._autoUpdateVersions) {
		remote._autoUpdateVersions = {} as any;
	}
	if (!remote._autoUpdateVersions[SYS_NAME]) {
		remote._autoUpdateVersions[SYS_NAME] = {} as any;
	}
	return remote._autoUpdateVersions[SYS_NAME][type] || '';
}

function ideUrlPropName() {
	if (isWin) {
		return 'windows';
	} else if (isMac) {
		return 'mac';
	} else {
		return 'linux';
	}
}

export const SYS_NAME = ideUrlPropName();

export async function loadRemoteState() {
	const ideState = await s3LoadJson<IDEJson>(OBJKEY_IDE_JSON);
	if (!ideState.patches) {
		ideState.patches = [];
	}
	return ideState;
}

export function saveRemoteState(remote: IDEJson) {
	return s3UploadJson(remote, OBJKEY_IDE_JSON);
}

export function ensurePatchData(version: any, state: IDEJson): IDEPatchJson {
	const latest = state.patches.find(item => item.version === version.toFixed(6));
	if (latest) {
		if (!latest[SYS_NAME]) {
			latest[SYS_NAME] = {} as any;
		}
		return latest;
	}
	const data: IDEPatchJson = {
		version: version.toFixed(6),
		[SYS_NAME]: {},
	} as any;
	state.patches.push(data);
	
	return data;
}
