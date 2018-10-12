import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { DownloadID, IDownloadTargetInfo, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';

class NodeDownloadServiceClient implements INodeDownloadService {
	_serviceBrand: any;
	private readonly ipc: INodeDownloadService;

	constructor(
		@IKendryteClientService channelService: IKendryteClientService,
	) {
		channelService.markEvents(INodeDownloadService, ['onProgress']);
		channelService.markMethod(INodeDownloadService, [
			'download',
			'cancel',
			'progress',
			'destroy',
			'waitResultFile',
			'downloadTemp',
		]);
		this.ipc = channelService.as<INodeDownloadService>(INodeDownloadService);
	}

	public onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>> {
		return this.ipc.onProgress(download);
	}

	public download(url: string, target: string, start = true): TPromise<DownloadID> {
		return this.ipc.download(url, target, start);
	}

	public start(download: DownloadID): TPromise<void> {
		return this.ipc.start(download);
	}

	public cancel(download: DownloadID): TPromise<void> {
		return this.ipc.cancel(download);
	}

	public progress(download: DownloadID): TPromise<INatureProgressStatus> {
		return this.ipc.progress(download);
	}

	public destroy(download: DownloadID): TPromise<void> {
		return this.ipc.destroy(download);
	}

	public waitResultFile(downloadId: DownloadID): TPromise<string> {
		return this.ipc.waitResultFile(downloadId);
	}

	public downloadTemp(url: string, start = true): TPromise<DownloadID> {
		return this.ipc.downloadTemp(url, start);
	}

	public getStatus(downloadId: DownloadID): TPromise<IDownloadTargetInfo> {
		return this.ipc.getStatus(downloadId);
	}
}

registerSingleton(INodeDownloadService, NodeDownloadServiceClient);
