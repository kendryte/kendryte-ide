import { IBuildPackageService, VersionMatrix } from 'vs/workbench/parts/maix/cmake/common/type';
import { TPromise } from 'vs/base/common/winjs.base';

export class BuildPackageService implements IBuildPackageService {
	_serviceBrand: any;

	constructor() {

	}

	public async downloadVersionData(id: string): TPromise<VersionMatrix> {
		return undefined;
	}

	public async getAllProjectNames(): TPromise<string[]> {
		return undefined;
	}

	public async upgradeEverything(): TPromise<void> {
		return undefined;
	}

	public async downloadOrUpdate(version: VersionMatrix): TPromise<void> {
		return undefined;
	}
}