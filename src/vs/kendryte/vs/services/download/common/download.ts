import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';
import { INatureProgressStatus } from 'vs/kendryte/vs/workbench/progress/common/progress';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';

export interface DownloadID {
	__id: string;
}

export function createDownloadId(id: string): DownloadID {
	if (typeof id !== 'string') {
		return id;
	}
	return {
		__id: id,
		toJSON() { return id; },
		toString() { return `DownloadID<${id}>`; },
		[Symbol.toStringTag]() { return 'DownloadID'; },
	} as DownloadID;
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

	download(url: string, target: string, start?: boolean, logger?: ILogService): TPromise<DownloadID>;
	downloadTemp(url: string, start?: boolean, logger?: ILogService): TPromise<DownloadID>;

	waitResultFile(downloadId: DownloadID): TPromise<string>;
	wait(download: DownloadID): TPromise<void>;

	start(download: DownloadID, logger?: ILogService): TPromise<void>;
	cancel(download: DownloadID): TPromise<void>;
	destroy(download: DownloadID): TPromise<void>;

	progress(download: DownloadID): TPromise<INatureProgressStatus>;
	getStatus(downloadId: DownloadID): TPromise<IDownloadTargetInfo>;
}

export const INodeDownloadService = createDecorator<INodeDownloadService>('nodeDownloadService');
