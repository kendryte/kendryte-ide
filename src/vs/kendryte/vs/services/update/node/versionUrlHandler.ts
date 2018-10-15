import { is64Bit } from 'vs/kendryte/vs/platform/node/versions';
import { IBasePackageInfo, IDE_HOMEPAGE, IIDEUpdateInfo, IPatchUpdateInfo } from 'vs/kendryte/vs/services/update/common/protocol';
import { OperatingSystem, OS } from 'vs/base/common/platform';
import { IDECurrentPatchVersion } from 'vs/kendryte/vs/services/update/node/myVersion';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

type KnownPlatform = 'windows' | 'linux' | 'mac';
type KnownArch = '32' | '64';

function archPropKeyName(): KnownArch {
	return is64Bit ? '64' : '32';
}

function platformPropKeyName(): KnownPlatform {
	switch (OS) {
		case OperatingSystem.Windows:
			return 'windows';
		case OperatingSystem.Linux:
			return 'linux';
		case OperatingSystem.Macintosh:
			return 'mac';
		default:
			return '' as any;
	}
}

export interface IVersionUrlHandler {
	_serviceBrand: any;

	getIDE(info: IIDEUpdateInfo): string;
	getIDEHomePage(info: IIDEUpdateInfo): string;
	getPatchList(info: IIDEUpdateInfo): { version: number; downloadUrl: string; }[];
	getMyVersion(info: IPatchUpdateInfo | IBasePackageInfo<any>): string;
}

export const IVersionUrlHandler = createDecorator<IVersionUrlHandler>('versionUrlHandler');

export abstract class VersionUrlHandler implements IVersionUrlHandler {
	_serviceBrand: any;
	private readonly platformKey: KnownPlatform;
	private readonly archKey: KnownArch;

	public isSupported: boolean;

	constructor() {
		this.platformKey = platformPropKeyName();
		this.archKey = archPropKeyName();

		this.isSupported = !!this.platformKey;
		if (!this.isSupported) {
			this.alertNotSupport();
		}
	}

	getIDE(info: IIDEUpdateInfo): string {
		return info[this.platformKey];
	}

	getIDEHomePage(info: IIDEUpdateInfo): string {
		return info.homepage || IDE_HOMEPAGE;
	}

	getPatchList(info: IIDEUpdateInfo): { version: number; downloadUrl: string; }[] {
		const current = IDECurrentPatchVersion();
		const ret = info.patches.filter((patch) => {
			return current < parseFloat(patch.version);
		}).map((patch) => {
			return {
				version: parseFloat(patch.version),
				downloadUrl: this.getMyVersion(patch),
			};
		});

		ret.toString = function () {
			return this.map(e => `  ${e.version}: ${e.downloadUrl}`).join('\n');
		};

		return ret;
	}

	getMyVersion(info: IPatchUpdateInfo | IBasePackageInfo<any>): string {
		if (info[this.platformKey]) {
			const platformVersion = info[this.platformKey];
			if (platformVersion.ignore) {
				return '';
			}
			const result = platformVersion[this.archKey] || platformVersion.generic;

			if (result) {
				return result;
			} else if (info.hasOwnProperty('source')) {
				return info['source'];
			} else {
				this.alertNotSupport();
				throw new Error('no supported architecture');
			}
		} else if (info.hasOwnProperty('source')) {
			return info['source'];
		} else {
			this.alertNotSupport();
			throw new Error('no supported platform');
		}
	}

	protected abstract alertNotSupport();
}
