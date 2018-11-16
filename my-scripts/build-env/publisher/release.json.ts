import { OBJKEY_DOWNLOAD_INDEX, OBJKEY_IDE_JSON, s3LoadJson, s3UploadBuffer, s3WebsiteUrl } from '../misc/awsUtil';
import { isMac, isWin } from '../misc/constants';

export interface IDEJson {
	version: string;
	_autoUpdateVersions: {
		windows: {main: string; patch: string;};
		mac: {main: string; patch: string;};
		linux: {main: string; patch: string;};
	},
	homepageUrl: string;
	windows: string;
	linux: string;
	mac: string;
	patches: IDEPatchJson[];
}

export interface IDEPatchJson {
	version: string;
	windows: {generic: string};
	mac: {generic: string};
	linux: {generic: string};
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

export async function saveRemoteState(remote: IDEJson) {
	await s3UploadBuffer({
		stream: Buffer.from(JSON.stringify(remote, null, 4) + '\n', 'utf8'),
		mime: 'application/json',
	}, OBJKEY_IDE_JSON);
}

export function ensurePatchData(version: any, state: IDEJson): IDEPatchJson {
	const latest = state.patches[state.patches.length - 1];
	if (latest && parseFloat(latest.version) === parseFloat(version)) {
		if (!latest[SYS_NAME]) {
			latest[SYS_NAME] = {} as any;
		}
		return latest;
	}
	const data: IDEPatchJson = {
		version: version.toString(6),
		[SYS_NAME]: {},
	} as any;
	state.patches.push(data);
	
	return data;
}
