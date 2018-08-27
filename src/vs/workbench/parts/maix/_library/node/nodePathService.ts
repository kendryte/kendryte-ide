import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { resolve } from 'path';
import product from 'vs/platform/node/product';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { isWindows } from 'vs/base/common/platform';
import { lstatSync } from 'fs';

export const INodePathService = createDecorator<INodePathService>('INodePathService');

export interface INodePathService {
	_serviceBrand: any;

	getInstallPath(): string;

	getDataPath(): string;

	exeFile(filePath: string): string;

	getToolchainBinPath(): string;

	getToolchainPath(): string;

	getSDKPath(): string;

	getPackagesPath(project?: string): string;
}

class NodePathService implements INodePathService {
	_serviceBrand: any;

	private sdkPathCache: string;
	private toolchainPathCache: string;

	constructor(
		@IEnvironmentService protected environmentService: IEnvironmentService,
	) { }

	getPackagesPath(project?: string) {
		if (project) {
			return resolve(this.getInstallPath(), 'packages', project);
		} else {
			return resolve(this.getInstallPath(), 'packages');
		}
	}

	getInstallPath() {
		if (this.environmentService.isBuilt) {
			return resolve(this.environmentService.execPath, '..');
		} else {
			return resolve(this.environmentService.execPath, '../../..');
		}
	}

	getDataPath() {
		return resolve(this.environmentService.userHome, product.dataFolderName);
	}

	exeFile(filePath: string) {
		return isWindows ? filePath + '.exe' : filePath;
	}

	getToolchainBinPath() {
		const rel = this.getToolchainPath();
		return rel ? resolve(rel, 'bin') : '';
	}

	getToolchainPath() {
		if (!this.toolchainPathCache) {
			let path = resolve(this.getInstallPath(), 'packages/toolchain');
			try {
				if (lstatSync(resolve(path, 'bin/')).isDirectory()) {
					this.toolchainPathCache = path;
				}
			} catch (e) { // noop
			}
			if (this.toolchainPathCache) {
				console.log('%cToolchain is found at %s.', 'color:green', path);
			} else {
				console.log('%cToolchain is expected to be found at %s, But not found.', 'color:red', path);
			}
		}
		return this.toolchainPathCache || '';
	}

	getSDKPath() {
		if (!this.sdkPathCache) {
			let path = resolve(this.getInstallPath(), 'packages/SDK');
			try {
				if (lstatSync(resolve(path, 'cmake/')).isDirectory()) {
					this.sdkPathCache = path;
				}
			} catch (e) { // noop
			}
			if (this.sdkPathCache) {
				console.log('%cSDK is found at %s.', 'color:green', path);
			} else {
				console.log('%cSDK is expected to be found at %s, But not found.', 'color:red', path);
			}
		}
		return this.sdkPathCache;
	}
}

registerSingleton(INodePathService, NodePathService);