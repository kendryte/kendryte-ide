import { IPackageRegistryService, PACKAGE_MANAGER_LOG_CHANNEL_ID, PackageTypes } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PackageBrowserInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageBrowserInput';
import { IRemotePackageInfo, PACKAGE_LIST_EXAMPLE, PACKAGE_LIST_LIBRARY } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { CancellationToken } from 'vs/base/common/cancellation';
import { copy, dirExists, fileExists, mkdirp, readDirsInDir, readFile, rimraf } from 'vs/base/node/pfs';
import { IPager } from 'vs/base/common/paging';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { IDownloadWithProgressService } from 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIBRARY_FOLDER_NAME, ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { PACKAGE_MANAGER_DISTRIBUTE_URL } from 'vs/kendryte/vs/services/update/common/protocol';
import { resolve as resolveUrl } from 'url';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { dumpDate } from 'vs/kendryte/vs/base/common/dumpDate';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';

export class PackageRegistryService implements IPackageRegistryService {
	_serviceBrand: any;
	private cached: any = {};
	private readonly logger: ILogService;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@IDownloadWithProgressService private readonly downloadWithProgressService: IDownloadWithProgressService,
		@IFileCompressService private readonly fileCompressService: IFileCompressService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INodePathService private readonly nodePathService: INodePathService,
		@IChannelLogService channelLogService: IChannelLogService,
		@INotificationService private notificationService: INotificationService,
	) {
		this.logger = channelLogService.createChannel('Package Manager', PACKAGE_MANAGER_LOG_CHANNEL_ID, true);
	}

	public async listLocal(): TPromise<IRemotePackageInfo[]> {
		const folder = this.nodePathService.workspaceFilePath(CMAKE_LIBRARY_FOLDER_NAME);
		if (!await dirExists(folder)) {
			return [];
		}
		const ret: IRemotePackageInfo[] = [];
		for (const item of await readDirsInDir(folder)) {
			const pkgFile = resolvePath(folder, item, CMAKE_CONFIG_FILE_NAME);
			const { json: config, warnings } = await this.nodeFileSystemService.readJsonFile<IRemotePackageInfo>(pkgFile);

			if (warnings.length) {
				this.logger.warn('package file (' + item + ') has error:\n' + warnings.map((err) => {
					return '\t' + err.message;
				}).join('\n'));
			}

			config.type = PackageTypes.Library;
			ret.push(config);
		}
		return ret;
	}

	openBrowser(sideByside: boolean = false): TPromise<any> {
		return this.editorService.openEditor(this.instantiationService.createInstance(PackageBrowserInput, null), null, sideByside ? SIDE_GROUP : ACTIVE_GROUP);
	}

	openPackageFile(sideByside: boolean = false): TPromise<any> {
		return this.editorService.openEditor({
			resource: URI.file(this.nodePathService.getPackageFile()),
		});
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

	private async getRegistry(type: PackageTypes): Promise<IRemotePackageInfo[]> {
		if (this.cached[type]) {
			return this.cached[type];
		}
		this.logger.info('fetch registry file from remote.');

		const filePath = await this.downloadWithProgressService.downloadTemp(this.registryUrl(type), this.logger);
		const fileContent = await readFile(filePath, 'utf8');

		const [registry, errors] = parseExtendedJson<IRemotePackageInfo[]>(fileContent);
		if (errors.length) {
			this.logger.warn('registry has error:\n' + errors.map((err) => {
				return '\t' + err.message;
			}).join('\n'));
		}

		if (!Array.isArray(registry)) {
			debugger;
			this.logger.error(type + ' registry is invalid.');
			throw new Error(type + ' registry is invalid. please try again later.');
		}

		registry.forEach((item) => {
			item.type = type;
		});

		return this.cached[type] = registry;
	}

	public async queryPackageVersions(type: PackageTypes, packageName: string, cancel: CancellationToken = CancellationToken.None): TPromise<IRemotePackageInfo> {
		const registry = await this.getRegistry(type);
		return registry.find((item) => {
			return item.name === packageName;
		});
	}

	public async queryPackages(type: PackageTypes, search: string | RegExp): TPromise<IPager<IRemotePackageInfo>> {
		let registry = await this.getRegistry(type);

		if (search) {
			let searchReg: RegExp;
			if (search instanceof RegExp) {
				searchReg = search;
			} else {
				searchReg = new RegExp(escapeRegExpCharacters(search), 'i');
			}
			registry = registry.filter((item) => {
				return searchReg.test(item.name);
			});
		}

		const pageSize = 20;
		return {
			firstPage: registry.slice(0, pageSize),
			total: registry.length,
			pageSize,
			getPage: (pageIndex: number, cancellationToken: CancellationToken): TPromise<IRemotePackageInfo[]> => {
				this.logger.info(' -> switch page to: ', pageIndex);
				const start = pageIndex * pageSize;
				return TPromise.as(registry.slice(start, start + pageSize));
			},
		};
	}

	private async installAllWork(deps: { [id: string]: string }, installed: string[], handle: INotificationHandle) {
		const keys = Object.keys(deps);
		let i = 1;
		for (const item of keys) {
			handle.updateMessage(`installing dependencies: (${i++} of ${keys.length}) ${item}`);

			const version = deps[item];
			if (/^https?:\/\//.test(version)) {
				await this.downloadFromAbsUrl(version, item, 'Unknown');
			} else {
				const pkgInfoReq = await this.queryPackages(PackageTypes.Library, new RegExp(escapeRegExpCharacters(item)));
				if (pkgInfoReq.total < 1) {
					throw new Error('No such package: ' + item);
				}
				const pkgInfo = pkgInfoReq.firstPage[0];
				const verInfo = pkgInfo.versions.find(item => item.versionName === version);
				if (!verInfo) {
					throw new Error('No such version: ' + item);
				}

				await this.downloadFromAbsUrl(this.findUrl(pkgInfo, version), item, version);
			}
		}
	}

	public async installAll(): TPromise<void> {
		const { json: pkgInfo, warnings } = await this.nodeFileSystemService.readPackageFile();
		if (warnings.length) {
			warnings.map(e => this.logger.error(e.message));
			await this.openPackageFile();
			throw new Error(warnings[0].message);
		}

		if (!pkgInfo.dependency) {
			await this.openPackageFile();
			throw new Error('invalid dependency defined in ' + CMAKE_CONFIG_FILE_NAME + '.');
		}

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: '',
		});

		await this.installAllWork(pkgInfo.dependency, [], handle).then(() => {
			handle.dispose();
		}, (e) => {
			handle.dispose();
			throw e;
		});
	}

	private findUrl(packageInfo: IRemotePackageInfo, version: string): string {
		const itemToInstall = packageInfo.versions.find((obj) => {
			return obj.versionName === version;
		});
		if (!itemToInstall) {
			this.logger.error('Unknown version.');
			throw new Error('Unknown version: ' + version);
		}

		return resolveUrl(PACKAGE_MANAGER_DISTRIBUTE_URL + '/', itemToInstall.downloadUrl);

	}

	public async installExample(packageInfo: IRemotePackageInfo, version: string, targetPath: string): TPromise<string> {
		this.logger.info('Install example: %s @ %s', packageInfo.name, version);

		const downloadUrl = this.findUrl(packageInfo, version);

		const target = await this.downloadWithProgressService.downloadTemp(downloadUrl, this.logger);
		const tempResultDir = await this.fileCompressService.extractTemp(target, this.logger);

		this.logger.info('download & extracted: ', tempResultDir);

		const jsonFile = resolvePath(tempResultDir, CMAKE_CONFIG_FILE_NAME);
		const { json: config, warnings } = await this.nodeFileSystemService.readJsonFile<ICompileInfo>(jsonFile);
		warnings.forEach((error) => {
			this.logger.error(error.message);
		});

		if (config.name) {
			config.name = packageInfo.name || 'unknown-example';
		}

		const finalPath = resolvePath(targetPath, config.name);
		this.logger.info(`  copy(${tempResultDir}, ${finalPath})`);
		await copy(tempResultDir, finalPath);

		return finalPath;
	}

	public async installDependency(packageInfo: IRemotePackageInfo, version: string): TPromise<void> {
		this.logger.info('Install package: %s @ %s', packageInfo.name, version);

		const downloadUrl = this.findUrl(packageInfo, version);

		const saveDirName = await this.downloadFromAbsUrl(downloadUrl, packageInfo.name, version);

		const currentConfigFile = this.nodePathService.getPackageFile();
		if (!await fileExists(currentConfigFile)) {
			await this.nodeFileSystemService.rawWriteFile(currentConfigFile, JSON.stringify({
				'$schema': 'vscode://schemas/CMakeLists',
				'name': 'unamed_project',
				'version': '0.0.1',
				'type': 'executable',
			}, null, 4));
		}
		await this.nodeFileSystemService.editJsonFile(currentConfigFile, ['dependency', saveDirName], downloadUrl);
	}

	private async downloadFromAbsUrl(downloadUrl: string, defaultName: string, defaultVersion: string): Promise<string> {
		const target = await this.downloadWithProgressService.downloadTemp(downloadUrl, this.logger);
		const tempResultDir = await this.fileCompressService.extractTemp(target, this.logger);

		this.logger.info('download & extracted: ', tempResultDir);

		const jsonFile = resolvePath(tempResultDir, CMAKE_CONFIG_FILE_NAME);
		const { json: config, warnings } = await this.nodeFileSystemService.readJsonFile<ICompileInfo>(jsonFile);
		warnings.forEach((error) => {
			this.logger.error(error.message);
		});

		if (!config.name) {
			config.name = defaultName || 'unknownlib';
			this.logger.warn('package do not have name. set default to ' + config.name);
			await this.nodeFileSystemService.editJsonFile(jsonFile, 'name', config.name);
		}
		if (!config.version) {
			config.version = defaultVersion || dumpDate.date(new Date, '.');
			this.logger.warn('package do not have version. set default to ' + config.version);
			await this.nodeFileSystemService.editJsonFile(jsonFile, 'version', config.version);
		}
		this.logger.info(`name:${config.name} version:${config.version}`);

		const packagesRoot = resolvePath(this.nodePathService.workspaceFilePath(), CMAKE_LIBRARY_FOLDER_NAME);
		const saveDirName = config.name;
		const saveDir = resolvePath(packagesRoot, saveDirName);
		this.logger.info(`  rimraf(${saveDir})`);
		await rimraf(saveDir);
		this.logger.info(`  mkdirp(${packagesRoot})`);
		await mkdirp(packagesRoot);
		this.logger.info(`  copy(${tempResultDir}, ${saveDir})`);
		await copy(tempResultDir, saveDir);

		return saveDirName;
	}
}