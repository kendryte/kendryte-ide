import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { DownloadID, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { INotificationRevoke, unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { showDownloadSpeed } from 'vs/kendryte/vs/base/common/speedShow';
import { ILogService } from 'vs/platform/log/common/log';

export interface IDownloadWithProgressService {
	_serviceBrand: any;

	download(url: string, target: string, logger?: ILogService, cancel?: () => void): Promise<string>;
	downloadTemp(url: string, logger?: ILogService, cancel?: () => void): Promise<string>;
	continue(title: string, id: DownloadID, logger?: ILogService, onDidCancel?: () => void): Promise<string>;
}

export const IDownloadWithProgressService = createDecorator<IDownloadWithProgressService>('downloadWithProgressService');

class DownloadWithProgressService implements IDownloadWithProgressService {
	_serviceBrand: any;

	constructor(
		@INodeDownloadService private readonly nodeDownloadService: INodeDownloadService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
	}

	private async handle(title: string, cb: () => Thenable<DownloadID>, onDidCancel?: () => void): Promise<string> {
		let handle: INotificationHandle & Partial<INotificationRevoke>;

		if (onDidCancel) {
			handle = this.notificationService.notify({
				severity: Severity.Info,
				message: 'downloading file: ' + title,
			});

			handle.onDidClose(() => {
				if (onDidCancel) {
					onDidCancel();
				}
			});
		} else {
			handle = unClosableNotify(this.notificationService, {
				severity: Severity.Info,
				message: 'downloading file: ' + title,
			});
		}

		const handleError = (e: Error) => {
			handle.progress.done();
			handle.updateSeverity(Severity.Error);
			handle.updateMessage(`download ${title} Error: ${e.message}`);
			if (handle.revoke) {
				handle.revoke();
			}
			throw e;
		};

		const downloadId = await (cb()).then(undefined, (e) => handleError(e));

		const info = await this.nodeDownloadService.getStatus(downloadId);
		const speed = showDownloadSpeed(info.total, info.current);
		let last = 0;

		this.nodeDownloadService.onProgress(downloadId)((v) => {
			if (v.total && v.current) {
				handle.progress.total(v.total);
				handle.progress.worked(v.current - last);
				last = v.current;
			} else {
				handle.progress.infinite();
				last = 0;
			}

			handle.updateMessage(`downloading file: ${speed(v.current || NaN)}\n${v.message} - ${title}`);
		});

		return await this.nodeDownloadService.waitResultFile(downloadId).then((r) => {
			if (handle.revoke) {
				handle.revoke();
			}
			handle.close();
			return r;
		}, (e) => handleError(e));
	}

	download(url: string, target: string, logger?: ILogService, onDidCancel?: () => void): Promise<string> {
		return this.handle(url, () => {
			return this.nodeDownloadService.download(url, target, true, logger);
		}, onDidCancel);
	}

	downloadTemp(url: string, logger?: ILogService, onDidCancel?: () => void): Promise<string> {
		return this.handle(url, () => {
			return this.nodeDownloadService.downloadTemp(url, true, logger);
		}, onDidCancel);
	}

	continue(title: string, id: DownloadID, logger?: ILogService, onDidCancel?: () => void): Promise<string> {
		return this.handle(title, () => {
			return this.nodeDownloadService.start(id, logger).then(() => id);
		}, onDidCancel);
	}
}

registerSingleton(IDownloadWithProgressService, DownloadWithProgressService);
