import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';
import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface DownloadID {
	__id: string;
}

export interface INodeDownloadService {
	_serviceBrand: any;

	onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>>;

	download(url: string, target: string): TPromise<DownloadID>;
	cancel(download: DownloadID): TPromise<void>;
	progress(download: DownloadID): TPromise<INatureProgressStatus>;
	destroy(download: DownloadID): TPromise<void>;
	waitResultFile(downloadId: DownloadID): TPromise<string>;
	downloadTemp(url: string): TPromise<DownloadID>;
}

export const INodeDownloadService = createDecorator<INodeDownloadService>('nodeDownloadService');
