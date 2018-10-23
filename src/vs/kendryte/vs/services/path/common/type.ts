import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INodePathService {
	_serviceBrand: any;

	getIDESourceCodeRoot(): string;
	getDataPath(): string;
	getSelfControllingRoot(): string;
	exeFile(filePath: string): string;
	getToolchainBinPath(): string;
	getToolchainPath(): string;
	getPackagesPath(project?: string): string;
	rawToolchainPath(): string;
	workspaceFilePath(s?: string): string;
	createUserLink(existsFile: string, linkFile: string): TPromise<void>;
	ensureTempDir(name?: string): TPromise<string>;
	/** @deprecated*/tempDir(name?: string): string;
	createAppLink(): TPromise<void>;
	getPackageFile(): string;
}

export const INodePathService = createDecorator<INodePathService>('nodePathService');
