import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import product from 'vs/platform/node/product';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { createLinuxDesktopShortcut, ensureLinkEquals, pathResolveNow } from 'vs/workbench/parts/maix/_library/node/shortcuts';
import { IShortcutOptions } from 'windows-shortcuts';
import { TPromise } from 'vs/base/common/winjs.base';
import { tmpdir } from 'os';
import { mkdirp } from 'vs/base/node/pfs';

class NodePathService implements INodePathService {
	_serviceBrand: any;

	private sdkPathExists: boolean;
	private toolchainPathExists: boolean;

	constructor(
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
	) {
		this.createUserLink(this.getInstallPath('.fast-links/_Extensions'), pathResolveNow('HOMEPATH', process.env.HOME, product.dataFolderName));
		this.createUserLink(this.getInstallPath('.fast-links/_LocalSettingAndStorage'), pathResolveNow('AppData', process.env.HOME, '.config', product.nameLong));
		this.createUserLink(this.getInstallPath('.fast-links/_LocalSettingAndStorageDevel'), pathResolveNow('AppData', process.env.HOME, '.config/code-oss-dev'));
	}

	createAppLink(): TPromise<void> {
		if (isWindows) {
			return this.createUserLink(
				`%APPDATA%/Microsoft/Windows/Start Menu/Programs/${product.nameLong}.lnk`,
				this.getInstallPath('bin/code.cmd'),
				{
					workingDir: this.getInstallPath(),
					desc: product.nameLong,
					icon: this.environmentService.execPath,
				},
			);
		} else {
			return createLinuxDesktopShortcut(
				this.getInstallPath(),
				this.getInstallPath('bin/code'),
			);
		}
	}

	tempDir(name?: string) {
		if (name) {
			return resolvePath(tmpdir(), product.dataFolderName, name);
		} else {
			return resolvePath(tmpdir(), product.dataFolderName);
		}
	}

	async ensureTempDir(name?: string): TPromise<string> {
		const tmp = this.tempDir(name);
		await mkdirp(tmp);
		return tmp;
	}

	createUserLink(linkFile: string, existsFile: string, windowsOptions?: Partial<IShortcutOptions>): TPromise<void> {
		console.log('create user link: %s -> %s', linkFile, existsFile);
		return ensureLinkEquals(linkFile, existsFile, windowsOptions);
	}

	getPackagesPath(project?: string) {
		if (project) {
			return resolvePath(this.getInstallPath(), 'packages', project);
		} else {
			return resolvePath(this.getInstallPath(), 'packages');
		}
	}

	getInstallPath(...path: string[]) {
		if (this.environmentService.isBuilt) {
			return resolvePath(this.environmentService.execPath, '..', ...path);
		} else {
			return resolvePath(this.environmentService.execPath, '../../..', ...path);
		}
	}

	getDataPath() {
		return resolvePath(this.environmentService.userHome, product.dataFolderName);
	}

	exeFile(filePath: string) {
		return isWindows ? filePath + '.exe' : filePath;
	}

	getToolchainBinPath() {
		const rel = this.getToolchainPath();
		return rel ? resolvePath(rel, 'bin') : '';
	}

	rawToolchainPath() {
		return resolvePath(this.getInstallPath(), 'packages/toolchain');
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

	rawSDKPath() {
		return resolvePath(this.getInstallPath(), 'packages/SDK');
	}

	getSDKPath() {
		const path = this.rawSDKPath();
		if (this.sdkPathExists) {
			return path;
		} else if (this.sdkPathExists === false) {
			return '';
		}
		try {
			this.sdkPathExists = lstatSync(resolvePath(path, 'cmake/')).isDirectory();
		} catch (e) { // noop
		}
		if (this.sdkPathExists) {
			console.log('%cSDK is found at %s.', 'color:green', path);
			return path;
		} else {
			console.log('%cSDK is expected to be found at %s, But not found.', 'color:red', path);
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

registerSingleton(INodePathService, NodePathService);