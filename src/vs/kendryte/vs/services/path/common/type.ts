import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INodePathService {
	_serviceBrand: any;

	getInstallPath(): string;
	getDataPath(): string;
	exeFile(filePath: string): string;
	getToolchainBinPath(): string;
	getToolchainPath(): string;
	getPackagesPath(project?: string): string;
	rawToolchainPath(): string;
	workspaceFilePath(s?: string): string;
	createUserLink(existsFile: string, linkFile: string): TPromise<void>;
	ensureTempDir(name?: string): TPromise<string>;
	tempDir(name?: string): string;
	createAppLink(): TPromise<void>;
}

export const INodePathService = createDecorator<INodePathService>('nodePathService');
