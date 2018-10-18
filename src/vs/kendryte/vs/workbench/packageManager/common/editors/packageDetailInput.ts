import { TPromise } from 'vs/base/common/winjs.base';
import { EditorInput } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';

export class PackageDetailInput extends EditorInput {

	static readonly ID = 'workbench.package-manager.input';

	get package(): IRemotePackageInfo { return this._package; }

	constructor(
		private _package: IRemotePackageInfo,
	) {
		super();
	}

	getTypeId(): string {
		return PackageDetailInput.ID;
	}

	getName(): string {
		return this.package.type + ': ' + this.package.name;
	}

	matches(other: any): boolean {
		if (!(other instanceof PackageDetailInput)) {
			return false;
		}

		const otherpackageInput = other as PackageDetailInput;

		return this.package.type === otherpackageInput.package.type &&
		       this.package.name === otherpackageInput.package.name;
	}

	resolve(): TPromise<any> {
		return TPromise.as(null);
	}

	supportsSplitEditor(): boolean {
		return false;
	}

	getResource(): URI {
		return URI.from({
			scheme: 'package',
			authority: this.package.type,
			path: '/' + this.package.name,
		});
	}
}