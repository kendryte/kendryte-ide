import { IPackage, IPackageRegistryService, PackageTypes } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PackageBrowserInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageBrowserInput';
import { IRemotePackageInfo, PACKAGE_LIST_EXAMPLE, PACKAGE_LIST_LIBRARY } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { CancellationToken } from 'vs/base/common/cancellation';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { readFile } from 'vs/base/node/pfs';
import { IPager } from 'vs/base/common/paging';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { IDownloadWithProgressService } from 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService';

export class PackageRegistryService implements IPackageRegistryService {
	_serviceBrand: any;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@IDownloadWithProgressService private readonly downloadWithProgressService: IDownloadWithProgressService,
	) {
		this.downloadWithProgressService.downloadTemp('https://s3.cn-northwest-1.amazonaws.com.cn/kendryte-ide/IDE/kendryte-ide-1.28.0-20180930.zip');
	}

	public async listLocal(query?: string): TPromise<IPackage[]> {
		return [];
	}

	openBrowser(sideByside: boolean = false): TPromise<any> {
		return this.editorService.openEditor(this.instantiationService.createInstance(PackageBrowserInput, null), null, sideByside ? SIDE_GROUP : ACTIVE_GROUP);
	}

	registryUrl(type: PackageTypes) {
		switch (type) {
			case PackageTypes.Library:
				return PACKAGE_LIST_LIBRARY;
			case PackageTypes.Example:
				return PACKAGE_LIST_EXAMPLE;
			default:
				throw new TypeError('unknown type of registry: ' + type);
		}
	}

	private async getRegistry(type: PackageTypes) {
		const filePath = await this.downloadWithProgressService.downloadTemp(this.registryUrl(type));
		const fileContent = await readFile(filePath, 'utf8');
		const [registry, errors] = parseExtendedJson<IRemotePackageInfo[]>(fileContent);
		if (errors.length) {
			console.warn('registry has small error: ', errors);
		}
		return registry;
	}

	public async queryPackageVersions(type: PackageTypes, packageName: string, cancel: CancellationToken = CancellationToken.None): TPromise<IRemotePackageInfo> {
		const registry = await this.getRegistry(type);
		return registry.find((item) => {
			return item.name === packageName;
		});
	}

	public async queryPackages(type: PackageTypes, search: string): TPromise<IPager<IRemotePackageInfo>> {
		let registry = await this.getRegistry(type);

		if (search) {
			const searchReg = new RegExp(escapeRegExpCharacters(search), 'i');
			registry = registry.filter((item) => {
				return searchReg.test(item.name);
			});
		}

		const pageSize = 20;
		return {
			firstPage: registry.slice(0, pageSize),
			total: registry.length,
			pageSize,
			getPage(pageIndex: number, cancellationToken: CancellationToken): TPromise<IRemotePackageInfo[]> {
				const start = pageIndex * pageSize;
				return TPromise.as(registry.slice(start, start + pageSize));
			},
		};
	}
}