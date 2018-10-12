import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { IRequestService } from 'vs/platform/request/node/request';
import { Event } from 'vs/base/common/event';
import { DownloadID, IDownloadTargetInfo, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { TPromise } from 'vs/base/common/winjs.base';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { DownloadTask } from 'vs/kendryte/vs/services/download/electron-main/downloadTask';
import { extname } from 'vs/base/common/paths';
import { INodePathService } from 'vs/kendryte/vs/platform/common/type';
import { hash } from 'vs/base/common/hash';

export class NodeDownloadService implements INodeDownloadService {
	_serviceBrand: any;

	private downloading = new Map<string, DownloadTask>();

	constructor(
		@IRequestService private requestService: IRequestService,
		@INodePathService private nodePathService: INodePathService,
	) {
	}

	private getTask(download: DownloadID) {
		return this.downloading.get(download.__id);
	}

	public async getStatus(downloadId: DownloadID): TPromise<IDownloadTargetInfo> {
		return this.getTask(downloadId).getInfo();
	}

	private setTask(download: DownloadID, t: DownloadTask) {
		return this.downloading.set(download.__id, t);
	}

	private hasTask(download: DownloadID) {
		return this.downloading.has(download.__id);
	}

	public onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>> {
		// console.log('onProgress called');
		return this.getTask(download).progressEvent;
	}

	public async download(url: string, target: string, start = true): TPromise<DownloadID> {
		const task = new DownloadTask(url, target, this.requestService, this.nodePathService);
		await task.prepare();

		const id = task.getInfo().id;

		if (!this.hasTask(id)) {
			// console.log('!New download item set! (%s)', id);
			this.setTask(id, task);
		}

		if (start) {
			await this.getTask(id).start();
		}

		return id;
	}

	public start(download: DownloadID): TPromise<void> {
		return this.getTask(download).start();
	}

	public async cancel(download: DownloadID): TPromise<void> {
		// console.log('cancel called');
		await this.getTask(download).stop();
		return this.wait(download);
	}

	public async progress(download: DownloadID): TPromise<INatureProgressStatus> {
		// console.log('progress called');
		return this.getTask(download).getProgress();
	}

	public async destroy(download: DownloadID): TPromise<void> {
		// console.log('destroy called');
		return this.getTask(download).destroy();
	}

	public async wait(download: DownloadID): TPromise<void> {
		// console.log('wait called');
		const d = this.getTask(download);
		d.finishEvent(([file, error]) => {
			d.dispose();
		});
		this.downloading.delete(download.__id);
	}

	public waitResultFile(download: DownloadID): TPromise<string> {
		// console.log('waitResultFile called');
		const d = this.getTask(download);
		return new TPromise((resolve, reject) => {
			d.finishEvent(([file, error]) => {
				d.dispose();
				if (error) {
					reject(error);
				} else {
					resolve(file);
				}
				this.wait(download);
			});
		});
	}

	public downloadTemp(url: string, start = true): TPromise<DownloadID> {
		return this.download(url, this.nodePathService.tempDir(`download/${hash(url)}${extname(url)}`), start);
	}
}

registerMainSingleton(INodeDownloadService, NodeDownloadService);
