import { IPackageRegistryService, PACKAGE_MANAGER_LOG_CHANNEL_ID } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { PackageBrowserInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageBrowserInput';
import { IRemotePackageInfo, PACKAGE_LIST_EXAMPLE, PACKAGE_LIST_LIBRARY } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { CancellationToken } from 'vs/base/common/cancellation';
import { copy, dirExists, fileExists, lstat, mkdirp, readDirsInDir, readFile, rename, rimraf } from 'vs/base/node/pfs';
import { IPager } from 'vs/base/common/paging';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { parseExtendedJson } from 'vs/kendryte/vs/base/common/jsonComments';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { CMAKE_CONFIG_FILE_NAME, CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { CMakeProjectTypes, ICompileInfo, ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { resolve as resolveUrl } from 'url';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { URI } from 'vs/base/common/uri';
import { dumpDate } from 'vs/kendryte/vs/base/common/dumpDate';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { PACKAGE_MANAGER_DISTRIBUTE_URL } from 'vs/kendryte/vs/base/common/constants/remoteRegistry';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { Emitter } from 'vs/base/common/event';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { filterProjectName } from 'vs/kendryte/vs/base/common/filterProjectName';
import { packageJsonObject, packageJsonString } from 'vs/kendryte/vs/base/common/cmakeTypeHelper';

export class PackageRegistryService implements IPackageRegistryService {
	_serviceBrand: any;
	private cached: any = {};
	private readonly logger: ILogService;

	private readonly _onLocalPackageChange = new Emitter<void>();
	public readonly onLocalPackageChange = this._onLocalPackageChange.event;

	constructor(
		@IChannelLogService channelLogService: IChannelLogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
		@INodeDownloadService private readonly downloadService: INodeDownloadService,
		@IFileCompressService private readonly fileCompressService: IFileCompressService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@ICMakeService private cmakeService: ICMakeService,
		@INotificationService private notificationService: INotificationService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		this.logger = channelLogService.createChannel('Package Manager', PACKAGE_MANAGER_LOG_CHANNEL_ID, true);
	}

	public async listLocal(projectPath?: string): Promise<ILibraryProject[]> {
		if (!projectPath) {
			projectPath = this.kendryteWorkspaceService.getCurrentWorkspace();
			if (!projectPath) {
				return [];
			}
		}

		const folder = resolvePath(projectPath!, CMAKE_LIBRARY_FOLDER_NAME);
		if (!await dirExists(folder)) {
			return [];
		}
		const ret: ILibraryProject[] = [];
		for (const item of await readDirsInDir(folder)) {
			const result = await this.kendryteWorkspaceService.readProjectSetting(resolvePath(folder, item)) as ILibraryProject;
			if (!result) {
				continue;
			}

			ret.push(result);
		}
		return ret;
	}

	async getPackageInfoLocal(packageType: CMakeProjectTypes, packageName: string): Promise<ILibraryProject | undefined> {
		const list = await this.listLocal();
		return list.find((pkg) => {
			return pkg.name === packageName && pkg.type === packageType;
		});
	}

	async getPackageInfoRegistry(packageType: CMakeProjectTypes, packageName: string): Promise<IRemotePackageInfo | undefined> {
		let registry = await this.getRegistry(packageType);
		return registry.find((pkg) => {
			return pkg.name === packageName;
		});
	}

	openBrowser(): Promise<any> {
		return this.editorService.openEditor(this.instantiationService.createInstance(PackageBrowserInput, null));
	}

	openPackageFile(projectPath: string, sideByside: boolean = false): Promise<any> {
		return this.editorService.openEditor({
			resource: URI.file(this.kendryteWorkspaceService.getProjectSetting(projectPath)),
		});
	}

	registryUrl(type: CMakeProjectTypes) {
		switch (type) {
			case CMakeProjectTypes.library:
				return PACKAGE_LIST_LIBRARY;
			case CMakeProjectTypes.executable:
				return PACKAGE_LIST_EXAMPLE;
			default:
				throw new TypeError('unknown type of registry: ' + type);
		}
	}

	private async getRegistry(type: CMakeProjectTypes): Promise<IRemotePackageInfo[]> {
		if (this.cached[type]) {
			return this.cached[type];
		}
		this.logger.info('fetch registry file from remote.');
		const downId = await this.downloadService.downloadTemp(this.registryUrl(type), true, this.logger);
		const filePath = await this.downloadService.waitResultFile(downId);
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

	public async queryPackageVersions(type: CMakeProjectTypes, packageName: string, cancel: CancellationToken = CancellationToken.None): Promise<IRemotePackageInfo | undefined> {
		const registry = await this.getRegistry(type);
		return registry.find((item) => {
			return item.name === packageName;
		});
	}

	public async queryPackages(type: CMakeProjectTypes, search: string | RegExp): Promise<IPager<IRemotePackageInfo>> {
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
			getPage: (pageIndex: number, cancellationToken: CancellationToken): Promise<IRemotePackageInfo[]> => {
				this.logger.info(' -> switch page to: ', pageIndex);
				const start = pageIndex * pageSize;
				return Promise.resolve(registry.slice(start, start + pageSize));
			},
		};
	}

	public async installAll(): Promise<void> {
		const workspaces = await this.kendryteWorkspaceService.getAllWorkspace();

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'Installing...',
			source: 'Package Manager',
		});
		handle.progress.infinite();

		for (const workspacePath of workspaces) {
			await this._installSingleWorkspace(workspacePath, handle).catch((e) => {
				handle.dispose();
				throw e;
			});
		}
		handle.dispose();
	}

	public installProject(dir = this.kendryteWorkspaceService.getCurrentWorkspace()) {
		if (!dir) {
			return Promise.resolve();
		}

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'Installing...',
			source: 'Package Manager',
		});
		handle.progress.infinite();

		return this._installSingleWorkspace(dir, handle).finally(() => {
			handle.dispose();
		});
	}

	public async _installSingleWorkspace(workspacePath: string, handle: INotificationHandle): Promise<void> {
		const pkgInfo = await this.kendryteWorkspaceService.readProjectSetting(workspacePath);
		if (!pkgInfo) {
			return; // not a project
		}
		const dependency = packageJsonObject(pkgInfo, 'dependency');
		if (!dependency) {
			await this.openPackageFile(workspacePath);
			throw new Error('invalid dependency defined in ' + CMAKE_CONFIG_FILE_NAME + '.');
		}

		const keys = Object.keys(dependency);
		let i = 1;
		for (const item of keys) {
			handle.updateMessage(`installing dependencies: (${i++} of ${keys.length}) ${item}`);

			const version = dependency[item];
			if (/^https?:\/\//.test(version)) {
				await this.downloadFromAbsUrl(version, item, 'Unknown');
			} else {
				const pkgInfoReq = await this.queryPackages(CMakeProjectTypes.library, new RegExp(escapeRegExpCharacters(item)));
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

	private findUrl(packageInfo: IRemotePackageInfo, version?: string): string {
		const itemToInstall = version
			? packageInfo.versions.find((obj) => {
				return obj.versionName === version;
			})
			: packageInfo.versions[packageInfo.versions.length - 1];
		if (!itemToInstall) {
			this.logger.error('Unknown version.');
			throw new Error('Unknown version: ' + version);
		}

		return resolveUrl(PACKAGE_MANAGER_DISTRIBUTE_URL + '/', itemToInstall.downloadUrl);
	}

	public async installExample(packageInfo: IRemotePackageInfo, version: string, targetPath: string): Promise<string> {
		this.logger.info('Install example: %s @ %s', packageInfo.name, version);

		const downloadUrl = this.findUrl(packageInfo, version);

		const downId = await this.downloadService.downloadTemp(downloadUrl, true, this.logger);
		const libZipFile = await this.downloadService.waitResultFile(downId);
		const tempResultDir = await this.fileCompressService.extractTemp(libZipFile, this.logger);

		this.logger.info('download & extracted: ', tempResultDir);

		const jsonFile = resolvePath(tempResultDir, CMAKE_CONFIG_FILE_NAME);
		const { json: config, warnings } = await this.nodeFileSystemService.readJsonFile<ICompileInfo>(jsonFile);
		warnings.forEach((error) => {
			this.logger.error(error.message);
		});

		config.name = packageInfo.name ? filterProjectName(packageInfo.name) : 'unknown-example';

		let finalPath = resolvePath(targetPath, config.name);
		let i = 0;
		while (await lstat(finalPath).then(() => true, () => false)) {
			i++;
			finalPath = resolvePath(targetPath, config.name + '_' + i.toFixed(0));
		}

		this.logger.info(`  copy(${tempResultDir}, ${finalPath})`);
		await copy(tempResultDir, finalPath);
		await rimraf(tempResultDir).catch((e) => {
			this.logger.error('Cannot remove Temp dir: %s. This error is ignored', e.message);
		});

		this._onLocalPackageChange.fire();
		return finalPath;
	}

	public async installDependency(packageInfo: IRemotePackageInfo, version?: string): Promise<void> {
		this.logger.info('Install package: %s @ %s', packageInfo.name, version);

		const downloadUrl = this.findUrl(packageInfo, version);

		const saveDirName = await this.downloadFromAbsUrl(downloadUrl, packageInfo.name, version);

		const currentConfigFile = this.kendryteWorkspaceService.getProjectSetting(
			this.kendryteWorkspaceService.requireCurrentWorkspace(),
		);
		if (!await fileExists(currentConfigFile)) {
			await this.nodeFileSystemService.rawWriteFile(currentConfigFile, JSON.stringify({
				'$schema': 'vscode://schemas/CMakeLists',
				'name': 'unamed_project',
				'version': '0.0.1',
				'type': 'executable',
				'source': ['src/main.c'],
			}, null, 4));
		}
		await this.nodeFileSystemService.editJsonFile(currentConfigFile, ['dependency', saveDirName], version || downloadUrl);

		this._onLocalPackageChange.fire();
	}

	private async downloadFromAbsUrl(downloadUrl: string, defaultName: string, defaultVersion: string | undefined): Promise<string> {
		const downId = await this.downloadService.downloadTemp(downloadUrl, true, this.logger);
		const libZipFile = await this.downloadService.waitResultFile(downId);
		const tempResultDir = await this.fileCompressService.extractTemp(libZipFile, this.logger);

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
		let version = packageJsonString(config, 'version');
		if (!version) {
			version = defaultVersion || dumpDate.date(new Date, '.');
			this.logger.warn('package do not have version. set default to ' + version);
			await this.nodeFileSystemService.editJsonFile(jsonFile, 'version', version);
		}
		this.logger.info(`name:${config.name} version:${version}`);

		const packagesRoot = this.kendryteWorkspaceService.requireCurrentWorkspaceFile(CMAKE_LIBRARY_FOLDER_NAME);
		const saveDirName = filterProjectName(config.name);
		const saveDir = resolvePath(packagesRoot, saveDirName);

		this.logger.info(`  rimraf(${saveDir})`);
		await this.cmakeService.shutdown();
		const delTemp = saveDir + '.delete';
		if (await dirExists(delTemp)) {
			await rimraf(delTemp);
		}
		if (await dirExists(saveDir)) {
			await rename(saveDir, delTemp);
			await rimraf(delTemp).catch();
		}

		this.logger.info(`  mkdirp(${packagesRoot})`);
		await mkdirp(packagesRoot);

		this.logger.info(`  copy(${tempResultDir}, ${saveDir})`);
		await copy(tempResultDir, saveDir);
		await rimraf(tempResultDir).catch((e) => {
			this.logger.error('Cannot remove Temp dir: %s. This error is ignored', e.message);
		});

		return saveDirName;
	}

	public async erasePackage(packageName: string) {
		const activeProject = this.kendryteWorkspaceService.requireCurrentWorkspace();

		const packageSaveDir = resolvePath(activeProject, CMAKE_LIBRARY_FOLDER_NAME, packageName);
		const currentConfigFile = this.kendryteWorkspaceService.getProjectSetting(activeProject);

		this.logger.info(`  rimraf(${packageSaveDir})`);

		await rimraf(packageSaveDir);

		await this.nodeFileSystemService.editJsonFile(currentConfigFile, ['dependency', packageName], undefined);

		this._onLocalPackageChange.fire();
	}
}
