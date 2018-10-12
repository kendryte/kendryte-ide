import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';
import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface DownloadID {
	__id: string;
}

export interface IDownloadTargetInfo {
	id: DownloadID;
	total: number;
	current: number;
	check: string;
	etag: string;
	lastModified: string;
}

export interface INodeDownloadService {
	_serviceBrand: any;

	/** TODO: this Event must dispose when download ok or error, so need to check leak. */
	onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>>;

	download(url: string, target: string, start?: boolean): TPromise<DownloadID>;
	start(download: DownloadID): TPromise<void>;
	cancel(download: DownloadID): TPromise<void>;
	progress(download: DownloadID): TPromise<INatureProgressStatus>;
	destroy(download: DownloadID): TPromise<void>;
	waitResultFile(downloadId: DownloadID): TPromise<string>;
	downloadTemp(url: string, start?: boolean): TPromise<DownloadID>;
	getStatus(downloadId: DownloadID): TPromise<IDownloadTargetInfo>;
}

export const INodeDownloadService = createDecorator<INodeDownloadService>('nodeDownloadService');
