// https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/release/IDE.json

export interface IDEJson {
	version: string;
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
