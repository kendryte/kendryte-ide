import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Segment } from 'vs/base/common/json';
import { ExParseError } from 'vs/kendryte/vs/base/common/jsonComments';
import { ICompileOptions } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';

export interface INodeFileSystemService {
	_serviceBrand: any;

	readFileIfExists(file: string): TPromise<string>;
	readFileIfExists(file: string, raw: true): TPromise<Buffer>;
	writeFileIfChanged(file: string, data: string | Buffer): TPromise<boolean>;
	copyWithin(from: string, to: string): TPromise<void>;
	copyReplace(from: string, to: string): TPromise<void>;

	readJsonFile<T>(file: string): TPromise<[T, ExParseError[]]>;
	editJsonFile(file: string, key: Segment[] | Segment, value: any): TPromise<void>;
	readPackageFile(): TPromise<[ICompileOptions, ExParseError[]]>;
}

export const INodeFileSystemService = createDecorator<INodeFileSystemService>('nodeFileSystemService');
