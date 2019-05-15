import { INatureProgressStatus } from 'vs/kendryte/vs/platform/config/common/progress';
import { IRequestService } from 'vs/platform/request/node/request';
import { Event } from 'vs/base/common/event';
import { DownloadID, IDownloadTargetInfo, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { DownloadTask, loadIdFromResumeFile } from 'vs/kendryte/vs/services/download/electron-main/downloadTask';
import { doubleExtname } from 'vs/kendryte/vs/base/common/doubleExtname';
import { hash } from 'vs/base/common/hash';
import { ILogService } from 'vs/platform/log/common/log';
import { defaultConsoleLogger } from 'vs/kendryte/vs/platform/log/node/consoleLogger';
import { osTempDir } from 'vs/kendryte/vs/base/common/resolvePath';

export class NodeDownloadService implements INodeDownloadService {
	_serviceBrand: any;

	private downloading = new Map<string, DownloadTask>();

	constructor(
		@IRequestService private requestService: IRequestService,
	) {
	}

	private getTask(download: DownloadID): DownloadTask {
		let ret: DownloadTask | undefined;
		if (typeof (download as any) === 'string') {
			ret = this.downloading.get(download as any);
		} else if (download) {
			ret = this.downloading.get(download.__id);
		}
		if (ret) {
			return ret;
		} else {
			throw new Error('Failed to find download with id: ' + download);
		}
	}

	private removeTask(download: DownloadID) {
		return this.downloading.delete(download.__id);
	}

	private setTask(download: DownloadID, t: DownloadTask) {
		return this.downloading.set(download.__id, t);
	}

	private hasTask(download: DownloadID) {
		return download && this.downloading.has(download.__id);
	}

	public async getStatus(download: DownloadID): Promise<IDownloadTargetInfo> {
		return download && this.getTask(download).getInfo();
	}

	public onProgress(download: DownloadID): Event<Partial<INatureProgressStatus>> {
		// console.log('onProgress called');
		return this.getTask(download).progressEvent;
	}

	public async download(url: string, target: string, start = true, logger: ILogService = defaultConsoleLogger): Promise<DownloadID> {
		if (!logger) {
			logger = defaultConsoleLogger;
			defaultConsoleLogger.warn('download file without a logger.');
		}
		logger.info('Download Task: ');
		logger.info('  From - ' + url);
		logger.info('  To   - ' + target);

		let id = await loadIdFromResumeFile(target, logger);

		let task: DownloadTask;
		if (id && this.hasTask(id)) {
			logger.info('Download task exists: ' + id);
			task = this.getTask(id);
		} else {
			task = new DownloadTask(id, url, target, this.requestService);
			task.onBeforeDispose(() => {
				logger.info('    - remove from list');
				this.removeTask(task.downloadId);
			});
			this.setTask(task.downloadId, task);
			id = task.downloadId;
			logger.info('New download task set: ' + id);
		}

		task.addLogTarget(logger);

		if (start) {
			logger.info('auto start download: %s', id);
			setTimeout(() => {
				task.start().catch((e) => {
					console.error('while auto start download', e);
				});
			}, 0);
		}

		return id;
	}

	public start(download: DownloadID, logger?: ILogService): Promise<void> {
		const task = this.getTask(download);
		if (logger) {
			task.addLogTarget(logger);
		}
		return task.start();
	}

	public async cancel(download: DownloadID): Promise<void> {
		// console.log('cancel called');
		await this.getTask(download).stop();
		return this.wait(download);
	}

	public async progress(download: DownloadID): Promise<INatureProgressStatus> {
		// console.log('progress called');
		return this.getTask(download).getProgress();
	}

	public async destroy(download: DownloadID): Promise<void> {
		// console.log('destroy called');
		return this.getTask(download).destroy();
	}

	public async wait(download: DownloadID): Promise<void> {
		// console.log('### wait called');
		return this.getTask(download).whenFinish().then(() => {
			return void 0;
		});
	}

	public waitResultFile(download: DownloadID): Promise<string> {
		// console.log('### waitResultFile called');
		return this.getTask(download).whenFinish().then((f) => {
			this.wait(download);
			return f;
		});
	}

	public downloadTemp(url: string, start = true, logger?: ILogService): Promise<DownloadID> {
		return this.download(url, osTempDir(`download/file${hash(url)}${doubleExtname(url)}`), start, logger);
	}
}

registerMainSingleton(INodeDownloadService, NodeDownloadService);
