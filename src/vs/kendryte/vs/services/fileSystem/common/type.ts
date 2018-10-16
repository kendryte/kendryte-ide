import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INodeFileSystemService {
	_serviceBrand: any;

	readFileIfExists(file: string): TPromise<string>;
	readFileIfExists(file: string, raw: true): TPromise<Buffer>;
	writeFileIfChanged(file: string, data: string | Buffer): TPromise<boolean>;
	copyWithin(from: string, to: string): TPromise<void>;
	copyReplace(from: string, to: string): TPromise<void>;
}

export const INodeFileSystemService = createDecorator<INodeFileSystemService>('nodeFileSystemService');
