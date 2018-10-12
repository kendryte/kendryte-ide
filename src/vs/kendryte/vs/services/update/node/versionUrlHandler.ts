import { is64Bit } from 'vs/kendryte/vs/platform/node/versions';
import { IDE_HOMEPAGE, IDE_MY_PATCH_VERSION, IIDEUpdateInfo, IPackageUpdateInfo, IPatchUpdateInfo } from 'vs/kendryte/vs/services/update/common/protocol';
import { OperatingSystem, OS } from 'vs/base/common/platform';

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

export abstract class VersionUrlHandler {
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

	getPatchList(info: IIDEUpdateInfo): string[] {
		const startFrom = info.patches.findIndex(e => e.version === IDE_MY_PATCH_VERSION);
		return info.patches.slice(startFrom + 1).map(e => this.getMyVersion(e));
	}

	getMyVersion(info: IPatchUpdateInfo | IPackageUpdateInfo): string {
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
