import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INodePathService {
	_serviceBrand: any;

	getIDESourceCodeRoot(): string;
	getSelfControllingRoot(): string;
	exeFile(filePath: string): string;
	getToolchainBinPath(): string;
	getToolchainPath(): string;
	getPackagesPath(project?: string): string;
	/** @deprecated*/
	rawToolchainPath(): string;
	workspaceFilePath(s?: string): string;
	createUserLink(existsFile: string, linkFile: string): TPromise<void>;
	ensureTempDir(name?: string): TPromise<string>;
	/** @deprecated osTempDir */tempDir(name?: string): string;
	createAppLink(): TPromise<void>;
	getPackageFile(): string;
}

export const INodePathService = createDecorator<INodePathService>('nodePathService');
