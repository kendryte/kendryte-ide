import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { ensureLinkEquals } from 'vs/kendryte/vs/platform/createShortcut/node/shortcuts';
import { IShortcutOptions } from 'windows-shortcuts';
import { tmpdir } from 'os';
import { mkdirp } from 'vs/base/node/pfs';
import { optional } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { memoize } from 'vs/base/common/decorators';
import { processEnvironmentPathList } from 'vs/kendryte/vs/base/common/platformEnv';
import { createWindowStartupMenuShortcut } from 'vs/kendryte/vs/workbench/topMenu/node/windows';
import { createLinuxApplicationOrDesktopShortcut } from 'vs/kendryte/vs/workbench/topMenu/node/linux';
import { createMacApplicationsLink } from 'vs/kendryte/vs/workbench/topMenu/node/darwin';

export class NodePathService implements INodePathService {
	_serviceBrand: any;

	private toolchainPathExists: boolean | undefined;

	constructor(
		@optional(IWorkspaceContextService) protected workspaceContextService: IWorkspaceContextService,
		@IEnvironmentService protected environmentService: IEnvironmentService,
		@ILogService protected logger: ILogService,
	) {
		const keys: (keyof NodePathService)[] = [
			'getInstallationPath',
			'getIDESourceCodeRoot',
			'getPackagesPath',
			'getSelfControllingRoot',
		];
		for (const k of keys) {
			logger.info(` {NodePathService} ${k} = ${this[k]()}`);
		}

		processEnvironmentPathList.add(...this.kendrytePaths());
	}

	@memoize
	getSelfControllingRoot() {
		// this is Application/xxxx (/Contents on mac) folder
		if (!this.environmentService.isBuilt) {
			// when dev, source code is always version control root
			return resolvePath(this.environmentService.appRoot);
		}

		return resolvePath(this.environmentService.appRoot, '../..');
	}

	public async createAppLink(): Promise<void> {
		if (isWindows) {
			await createWindowStartupMenuShortcut(this.getInstallationPath());
		} else if (isLinux) {
			await createLinuxApplicationOrDesktopShortcut(this.getInstallationPath());
		} else {
			await createMacApplicationsLink(this.getInstallationPath());
		}
	}

	@memoize
	getInstallationPath() {
		// this is the top most folder, contains updater & applications & etc
		if (this.environmentService.isBuilt) {
			if (isMacintosh) {
				return resolvePath(this.getSelfControllingRoot(), '../../..');
			} else {
				return resolvePath(this.getSelfControllingRoot(), '../..');
			}
		} else {
			return resolvePath(this.getSelfControllingRoot(), '../kendryte-ide-shell/build/DebugContents');
		}
	}

	kendrytePaths(): string[] {
		return [
			resolvePath(this.getInstallationPath(), 'bin'),
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
		// this is LocalPackage
		if (process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR) {
			return resolvePath(process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR);
		}

		return resolvePath(this.getInstallationPath(), 'LocalPackage');
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
}

