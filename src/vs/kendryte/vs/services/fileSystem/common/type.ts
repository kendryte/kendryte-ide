import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Segment } from 'vs/base/common/json';
import { ExParseError } from 'vs/kendryte/vs/base/common/jsonComments';
import { ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export interface IJSONResult<T> {
	json: T;
	warnings: ExParseError[];
}

export interface INodeFileSystemService {
	_serviceBrand: any;

	readFile(file: string): Promise<string>;

	readFileIfExists(file: string): Promise<string>;
	readFileIfExists(file: string, raw: true): Promise<Buffer>;
	writeFileIfChanged(file: string, data: string | Buffer): Promise<boolean>;
	copyWithin(from: string, to: string): Promise<void>;
	copyReplace(from: string, to: string): Promise<void>;

	rawWriteFile(file: string, data: string | Buffer): Promise<void>

	readJsonFile<T>(file: string): Promise<IJSONResult<T>>;
	editJsonFile(file: string, key: Segment[] | Segment, value: any): Promise<void>;
	readPackageFile(): Promise<IJSONResult<ICompileInfo>>;
	tryWriteInFolder(packagesPath: string): Promise<boolean>;
	prepareSocketFile(s: string): Promise<string>;

	deleteFileIfEsxists(filePath: string): Promise<boolean>;
}

export const INodeFileSystemService = createDecorator<INodeFileSystemService>('nodeFileSystemService');
