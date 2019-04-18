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
import { wrapActionWithFileLock } from 'vs/kendryte/vs/base/node/fileLock';

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

	public async getStatus(download: DownloadID): Promise<IDownloadTargetInfo> {
		return download && this.getTask(download).getInfo();
	}

	private setTask(download: DownloadID, t: DownloadTask) {
		return this.downloading.set(download.__id, t);
	}

	private hasTask(download: DownloadID) {
		return download && this.downloading.has(download.__id);
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

		if (id && this.hasTask(id)) {
			logger.info('Download task exists: ' + id);
		} else {
			const task = new DownloadTask(url, target, this.requestService);
			id = await wrapActionWithFileLock(url, logger, async () => {
				task.addLogTarget(logger);

				await task.prepare();
				const id = task.getInfo().id;

				this.setTask(id, task);
				logger.info('New download task set: ' + id);

				return id;
			}).catch((e) => {
				task.dispose();
				throw e;
			});
		}

		if (logger) {
			this.getTask(id).addLogTarget(logger);
		}

		if (start) {
			logger.info('start download: %s', id);
			await this.getTask(id).start();
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
		const task = this.getTask(download);
		return new Promise((resolve, reject) => {
			task.finishEvent(([file, error]) => {
				// console.log('### download dispose', task.getInfo().id.__id, this.downloading.size);
				task.dispose();
				this.downloading.delete(task.getInfo().id.__id);
				// console.log('### download disposed', this.downloading.size);

				if (error) {
					reject(error);
				} else {
					resolve(void 0);
				}
			});
		});
	}

	public waitResultFile(download: DownloadID): Promise<string> {
		// console.log('### waitResultFile called');
		const d = this.getTask(download);
		return new Promise((resolve, reject) => {
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

	public downloadTemp(url: string, start = true, logger?: ILogService): Promise<DownloadID> {
		return this.download(url, osTempDir(`download/file${hash(url)}${doubleExtname(url)}`), start, logger);
	}
}

registerMainSingleton(INodeDownloadService, NodeDownloadService);
