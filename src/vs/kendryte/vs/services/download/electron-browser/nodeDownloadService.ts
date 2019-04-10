import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/common/ipcType';
import { INatureProgressStatus } from 'vs/kendryte/vs/platform/config/common/progress';
import { DownloadID, IDownloadTargetInfo, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { Event } from 'vs/base/common/event';
import { ILogService } from 'vs/platform/log/common/log';
import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';

class NodeDownloadServiceClient implements INodeDownloadService {
	_serviceBrand: any;
	private readonly ipc: INodeDownloadService;

	constructor(
		@IKendryteClientService channelService: IKendryteClientService,
		@ILifecycleService lifecycleService: ILifecycleService,
	) {
		channelService.markEventMethod(INodeDownloadService, ['onProgress']);
		channelService.markMethod(INodeDownloadService, [
			'download',
			'downloadTemp',

			'wait',
			'waitResultFile',

			'start',
			'cancel',
			'destroy',

			'progress',
			'getStatus',
		]);
		this.ipc = channelService.as<INodeDownloadService>(INodeDownloadService);
	}

	public onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>> {
		return this.ipc.onProgress(download);
	}

	public download(url: string, target: string, start = true, logger?: ILogService): Promise<DownloadID> {
		return this.ipc.download(url, target, start, logger);
	}

	public downloadTemp(url: string, start = true, logger?: ILogService): Promise<DownloadID> {
		return this.ipc.downloadTemp(url, start, logger);
	}

	public start(download: DownloadID): Promise<void> {
		return this.ipc.start(download);
	}

	public cancel(download: DownloadID): Promise<void> {
		return this.ipc.cancel(download);
	}

	public progress(download: DownloadID): Promise<INatureProgressStatus> {
		return this.ipc.progress(download);
	}

	public destroy(download: DownloadID): Promise<void> {
		return this.ipc.destroy(download);
	}

	public wait(downloadId: DownloadID): Promise<void> {
		return this.ipc.wait(downloadId);
	}

	public waitResultFile(downloadId: DownloadID): Promise<string> {
		return this.ipc.waitResultFile(downloadId);
	}

	public getStatus(downloadId: DownloadID): Promise<IDownloadTargetInfo> {
		return this.ipc.getStatus(downloadId);
	}
}

registerSingleton(INodeDownloadService, NodeDownloadServiceClient);
