import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Segment } from 'vs/base/common/json';
import { ExParseError } from 'vs/kendryte/vs/base/common/jsonComments';
import { ICompileOptions } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';

export interface INodeFileSystemService {
	_serviceBrand: any;

	readFileIfExists(file: string): Promise<string>;
	readFileIfExists(file: string, raw: true): Promise<Buffer>;
	writeFileIfChanged(file: string, data: string | Buffer): Promise<boolean>;
	copyWithin(from: string, to: string): Promise<void>;
	copyReplace(from: string, to: string): Promise<void>;

	rawWriteFile(file: string, data: string | Buffer): Promise<void>

	readJsonFile<T>(file: string): Promise<[T, ExParseError[]]>;
	editJsonFile(file: string, key: Segment[] | Segment, value: any): Promise<void>;
	readPackageFile(): Promise<[ICompileOptions, ExParseError[]]>;
	tryWriteInFolder(packagesPath: string): Promise<boolean>;
}

export const INodeFileSystemService = createDecorator<INodeFileSystemService>('nodeFileSystemService');
