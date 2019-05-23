import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INodePathService {
	_serviceBrand: any;

	getInstallationPath(): string;
	getIDESourceCodeRoot(): string;
	getSelfControllingRoot(): string;
	exeFile(filePath: string): string;
	getToolchainBinPath(): string;
	getToolchainPath(): string;
	getPackagesPath(project?: string): string;
	/** @deprecated*/
	rawToolchainPath(): string;
	/** @deprecated do not use */createUserLink(existsFile: string, linkFile: string): Promise<void>;
	ensureTempDir(name?: string): Promise<string>;
	/** @deprecated osTempDir */tempDir(name?: string): string;
	createAppLink(): Promise<void>;
	kendrytePaths(): string[];
}

export const INodePathService = createDecorator<INodePathService>('nodePathService');
