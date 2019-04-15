import { EditorInput } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { CMakeProjectTypes, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';

export interface IPackageInfo {
	type: string;
	name: string;
}

export class PackageDetailCompletionInput extends EditorInput {
	constructor(
		private readonly packageName: string,
		private readonly packageType: CMakeProjectTypes,
		@IPackageRegistryService private readonly packageRegistryService: IPackageRegistryService,
	) {
		super();
	}

	matches(other: any): boolean {
		if (!(other instanceof PackageDetailCompletionInput)) {
			return false;
		}

		const otherpackageInput = other as PackageDetailCompletionInput;

		return this.packageType === otherpackageInput.packageType &&
			this.packageName === otherpackageInput.packageName;
	}

	getName(): string {
		return this.packageType + ': ' + this.packageName;
	}

	supportsSplitEditor(): boolean {
		return false;
	}

	getResource(): URI {
		return URI.from({
			scheme: 'package',
			authority: this.packageType,
			path: '/' + this.packageName,
		});
	}

	async resolve(): Promise<any/* IPackageLocalRemoteInfo */> {
		const local = await this.packageRegistryService.getPackageInfoLocal(this.packageType, this.packageName);
		const remote = await this.packageRegistryService.getPackageInfoRegistry(this.packageType, this.packageName);
		if (local || remote) {
			return { local, remote };
		} else {
			throw new Error('What is that package?');
		}
	}

	getTypeId(): string {
		return 'workbench.package-manager.input';
	}
}

export interface IPackageLocalRemoteInfo {
	local?: ILibraryProject;
	remote?: IRemotePackageInfo;
}
