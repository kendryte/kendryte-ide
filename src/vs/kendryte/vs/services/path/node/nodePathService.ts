import product from 'vs/platform/node/product';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';
import { resolvePath, TEMP_DIR_NAME } from 'vs/kendryte/vs/base/node/resolvePath';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { createLinuxDesktopShortcut, ensureLinkEquals } from 'vs/kendryte/vs/platform/createShortcut/node/shortcuts';
import { IShortcutOptions } from 'windows-shortcuts';
import { TPromise } from 'vs/base/common/winjs.base';
import { tmpdir } from 'os';
import { mkdirp } from 'vs/base/node/pfs';
import { optional } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { memoize } from 'vs/base/common/decorators';
import { basename } from 'vs/base/common/paths';

export class NodePathService implements INodePathService {
	_serviceBrand: any;

	private toolchainPathExists: boolean;

	constructor(
		@optional(IWorkspaceContextService) protected workspaceContextService: IWorkspaceContextService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
		@ILogService protected logger: ILogService,
	) {
		const keys: (keyof NodePathService)[] = [
			'getIDESourceCodeRoot',
			'getDataPath',
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
	}

	@memoize
	getSelfControllingRoot() {
		if (!this.environmentService.isBuilt) {
			// when dev, source code is always version control root
			return resolvePath(this.environmentService.appRoot);
		}
		if (isMacintosh) {
			// Mac has a Contents folder, other platform do not have
			return resolvePath(this.environmentService.appRoot, '../../..');
		}

		return resolvePath(this.environmentService.appRoot, '../..');
	}

	createAppLink(): TPromise<void> {
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

	/** @deprecated */
	tempDir(name?: string) {
		if (name) {
			return resolvePath(tmpdir(), TEMP_DIR_NAME, name);
		} else {
			return resolvePath(tmpdir(), TEMP_DIR_NAME);
		}
	}

	async ensureTempDir(name?: string): TPromise<string> {
		const tmp = this.tempDir(name);
		await mkdirp(tmp);
		return tmp;
	}

	createUserLink(linkFile: string, existsFile: string, windowsOptions?: Partial<IShortcutOptions>): TPromise<void> {
		this.logger.info('create user link if not: %s -> %s', linkFile, existsFile);
		return ensureLinkEquals(linkFile, existsFile, windowsOptions);
	}

	getPackagesPath(project?: string) {
		if (project) {
			return resolvePath(this.getDataPath(), 'packages', project);
		} else {
			return resolvePath(this.getDataPath(), 'packages');
		}
	}

	@memoize
	getIDESourceCodeRoot() {
		// this is electron's resource/app
		return resolvePath(this.environmentService.appRoot);
	}

	@memoize
	getDataPath() {
		if (process.env['VSCODE_PORTABLE']) {
			return resolvePath(process.env['VSCODE_PORTABLE']);
		} else {
			return resolvePath(this.environmentService.userHome, product.dataFolderName);
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
		return resolvePath(this.getDataPath(), 'packages/toolchain');
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

