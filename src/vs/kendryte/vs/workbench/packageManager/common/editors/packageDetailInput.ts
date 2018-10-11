import { TPromise } from 'vs/base/common/winjs.base';
import { EditorInput } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IPackage, PackageTypes } from 'vs/kendryte/vs/workbench/packageManager/common/type';

export class PackageDetailInput extends EditorInput {

	static readonly ID = 'workbench.package-manager.input';

	get package(): IPackage { return this._package; }

	constructor(
		private _package: IPackage,
	) {
		super();
	}

	getTypeId(): string {
		return PackageDetailInput.ID;
	}

	getName(): string {
		return PackageTypes[this.package.type] + ':' + this.package.name;
	}

	matches(other: any): boolean {
		if (!(other instanceof PackageDetailInput)) {
			return false;
		}

		const otherpackageInput = other as PackageDetailInput;

		return this.package.id === otherpackageInput.package.id;
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
			path: this.package.id,
		});
	}
}