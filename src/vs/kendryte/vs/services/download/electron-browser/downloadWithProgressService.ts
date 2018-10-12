import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { DownloadID, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { unClosableNotify } from 'vs/kendryte/vs/platform/progress/common/unClosableNotify';
import { showDownloadSpeed } from 'vs/kendryte/vs/base/common/speedShow';

export interface IDownloadWithProgressService {
	_serviceBrand: any;

	download(url: string, target: string, cancel?: () => void): TPromise<string>;
	downloadTemp(url: string, cancel?: () => void): TPromise<string>;
	continue(title: string, id: DownloadID, onDidCancel?: () => void): TPromise<string>;
}

export const IDownloadWithProgressService = createDecorator<IDownloadWithProgressService>('downloadWithProgressService');

class DownloadWithProgressService implements IDownloadWithProgressService {
	_serviceBrand: any;

	constructor(
		@INodeDownloadService private readonly nodeDownloadService: INodeDownloadService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
	}

	private async handle(title: string, onDidCancel: () => void, cb: (...args: any[]) => Thenable<DownloadID>, args: any[]): TPromise<string> {
		let handle: INotificationHandle;

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
			throw e;
		};

		const downloadId = await (cb(...args)).then(undefined, (e) => handleError(e));

		const info = await this.nodeDownloadService.getStatus(downloadId);
		const speed = showDownloadSpeed(info.total, info.current);
		let last = 0;

		this.nodeDownloadService.onProgress(downloadId)((v) => {
			if (v.total) {
				handle.progress.total(v.total);
				handle.progress.worked(v.current - last);
				last = v.current;
			} else {
				handle.progress.infinite();
				last = 0;
			}

			handle.updateMessage(`downloading file: ${title} - ${v.message}\n` + speed(v.current));
		});

		return await this.nodeDownloadService.waitResultFile(downloadId).then((r) => {
			handle.progress.done();
			handle.updateMessage(`download ${title} complete: ${r}`);
			return r;
		}, (e) => handleError(e));
	}

	download(url: string, target: string, onDidCancel?: () => void): TPromise<string> {
		return this.handle(url, onDidCancel, this.nodeDownloadService.download.bind(this.nodeDownloadService), [url, target]);
	}

	downloadTemp(url: string, onDidCancel?: () => void): TPromise<string> {
		return this.handle(url, onDidCancel, this.nodeDownloadService.downloadTemp.bind(this.nodeDownloadService), [url]);
	}

	continue(title: string, id: DownloadID, onDidCancel?: () => void): TPromise<string> {
		return this.handle(title, onDidCancel, () => Promise.resolve(id), []);
	}
}

registerSingleton(IDownloadWithProgressService, DownloadWithProgressService);
