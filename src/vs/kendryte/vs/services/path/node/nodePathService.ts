import product from 'vs/platform/product/node/product';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { isLinux, isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { createLinuxDesktopShortcut, ensureLinkEquals } from 'vs/kendryte/vs/platform/createShortcut/node/shortcuts';
import { IShortcutOptions } from 'windows-shortcuts';
import { tmpdir } from 'os';
import { mkdirp } from 'vs/base/node/pfs';
import { optional } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { memoize } from 'vs/base/common/decorators';
import { basename } from 'vs/base/common/path';
import { processEnvironmentPathList } from 'vs/kendryte/vs/base/common/platformEnv';

export class NodePathService implements INodePathService {
	_serviceBrand: any;

	private toolchainPathExists: boolean | undefined;

	constructor(
		@optional(IWorkspaceContextService) protected workspaceContextService: IWorkspaceContextService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
		@ILogService protected logger: ILogService,
	) {
		const keys: (keyof NodePathService)[] = [
			'getIDESourceCodeRoot',
			'getPackagesPath',
			'getSelfControllingRoot',
		];
		for (const k of keys) {
			logger.info(` {NodePathService} ${k} = ${this[k]()}`);
		}

		if (!workspaceContextService) {
			// FIXME: portable mode do not use HOME
			// this.createUserLink(this.getInstallPath('.fast-links/_Extensions'), pathResolveNow('HOMEPATH', process.env.HOME, product.dataFolderName));
			// this.createUserLink(this.getInstallPath('.fast-links/_LocalSettingAndStorage'), pathResolveNow('AppData', process.env.HOME, '.config', product.nameLong));
			// this.createUserLink(this.getInstallPath('.fast-links/_LocalSettingAndStorageDevel'), pathResolveNow('AppData', process.env.HOME, '.config/code-oss-dev'));

			this.workspaceFilePath = () => {
				throw new Error('cannot use NodePathService::workspaceFilePath in main process.');
			};
		}

		processEnvironmentPathList.add(...this.kendrytePaths());
	}

	@memoize
	getSelfControllingRoot() {
		if (!this.environmentService.isBuilt) {
			// when dev, source code is always version control root
			return resolvePath(this.environmentService.appRoot);
		}

		return resolvePath(this.environmentService.appRoot, '../..');
	}

	createAppLink(): Promise<void> {
		if (!this.environmentService.isBuilt) {
			return Promise.reject(new Error('development mode do not support create link'));
		}
		if (isWindows) {
			return this.createUserLink(
				`%APPDATA%/Microsoft/Windows/Start Menu/Programs/${product.nameLong}.lnk`,
				resolvePath(this.getSelfControllingRoot(), 'bin/code.cmd'),
				{
					workingDir: this.getSelfControllingRoot(),
					desc: product.nameLong,
					icon: this.environmentService.execPath,
				},
			);
		} else if (isLinux) {
			return createLinuxDesktopShortcut(
				this.getSelfControllingRoot(),
				resolvePath(this.getSelfControllingRoot(), 'bin/code'),
			);
		} else {
			const root = this.getSelfControllingRoot();
			return this.createUserLink(
				resolvePath('/Applications', basename(root)),
				resolvePath(root),
			);
		}
	}

	getPackageFile() {
		return this.workspaceFilePath(CMAKE_CONFIG_FILE_NAME);
	}

	kendrytePaths(): string[] {
		return [
			this.getToolchainBinPath(),
			this.getPackagesPath('cmake/bin'),
			this.getPackagesPath('jlink'),
		];
	}

	/** @deprecated */
	tempDir(name?: string) {
		if (name) {
			return resolvePath(tmpdir(), name);
		} else {
			return resolvePath(tmpdir());
		}
	}

	async ensureTempDir(name?: string): Promise<string> {
		const tmp = this.tempDir(name);
		await mkdirp(tmp);
		return tmp;
	}

	createUserLink(linkFile: string, existsFile: string, windowsOptions?: Partial<IShortcutOptions>): Promise<void> {
		this.logger.info('create user link if not: %s -> %s', linkFile, existsFile);
		return ensureLinkEquals(linkFile, existsFile, windowsOptions);
	}

	getPackagesPath(project?: string) {
		if (project) {
			return resolvePath(this.getDataPath(), project);
		} else {
			return resolvePath(this.getDataPath());
		}
	}

	@memoize
	getIDESourceCodeRoot() {
		// this is electron's resource/app
		return resolvePath(this.environmentService.appRoot);
	}

	@memoize
	private getDataPath() {
		if (process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR) {
			return resolvePath(process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR);
		}
		if (this.environmentService.isBuilt) {
			return resolvePath(this.getSelfControllingRoot(), '../../LocalPackage');
		} else {
			return resolvePath(this.getSelfControllingRoot(), '../kendryte-ide-shell/build/DebugContents/LocalPackage');
		}
	}

	exeFile(filePath: string) {
		return isWindows ? filePath + '.exe' : filePath;
	}

	getToolchainBinPath() {
		const rel = this.getToolchainPath();
		return rel ? resolvePath(rel, 'bin') : '';
	}

	rawToolchainPath() {
		return this.getPackagesPath('toolchain');
	}

	getToolchainPath() {
		const path = this.rawToolchainPath();
		if (this.toolchainPathExists) {
			return path;
		} else if (this.toolchainPathExists === false) {
			return '';
		}
		try {
			this.toolchainPathExists = lstatSync(resolvePath(path, 'bin/')).isDirectory();
		} catch (e) { // noop
		}
		if (this.toolchainPathExists) {
			console.log('%cToolchain is found at %s.', 'color:green', path);
			return path;
		} else {
			console.log('%cToolchain is expected to be found at %s, But not found.', 'color:red', path);
			return '';
		}
	}

	public workspaceFilePath(s: string = './'): string {
		const resolver: IWorkspaceFolder = this.workspaceContextService.getWorkspace().folders[0];
		if (resolver) {
			return resolvePath(resolver.uri.fsPath, s);
		} else {
			return '';
		}
	}
}

