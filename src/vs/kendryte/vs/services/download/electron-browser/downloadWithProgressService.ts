import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { TPromise } from 'vs/base/common/winjs.base';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { DownloadID, INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';

export interface IDownloadWithProgressService {
	_serviceBrand: any;

	download(url: string, target: string, cancel?: () => void): TPromise<string>;
	downloadTemp(url: string, cancel?: () => void): TPromise<string>;
}

export const IDownloadWithProgressService = createDecorator<IDownloadWithProgressService>('downloadWithProgressService');

class DownloadWithProgressService implements IDownloadWithProgressService {
	_serviceBrand: any;

	constructor(
		@INodeDownloadService private readonly nodeDownloadService: INodeDownloadService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
	}

	private async handle(url: string, remotePromise: TPromise<DownloadID>, onDidCancel: () => void): TPromise<string> {
		const downloadId = await remotePromise;

		let handle: INotificationHandle;
		const startAt = Date.now();

		let message = 'download file from ' + url;
		let total: number = '' as any;
		let last = 0;
		const start = () => {
			handle = this.notificationService.notify({
				severity: Severity.Info,
				message,
			});
			if (isNaN(total)) {
				handle.progress.infinite();
			} else {
				handle.progress.total(total);
				handle.progress.worked(last);
			}
		};
		start();

		handle.onDidClose(() => {
			if (onDidCancel) {
				onDidCancel();
			} else {
				start(); // reset it
			}
		});

		const dispose = await this.nodeDownloadService.onProgress(downloadId)((v) => {
			handle.progress.total(v.total);
			total = v.total;

			handle.progress.worked(v.current - last);
			last = v.current;

			const kbps = last / (Date.now() - startAt);

			handle.updateMessage(`${v.message} - ${kbps.toFixed(0)}KB/s (${(100 * last / total).toFixed(1)}%)`);
			message = v.message;
		});

		const ret = await this.nodeDownloadService.waitResultFile(downloadId).then((r) => {
			handle.progress.done();
			handle.updateMessage('complete: ' + r);
			return r;
		}, (e) => {
			handle.progress.done();
			handle.updateSeverity(Severity.Error);
			handle.updateMessage(e);
			return null;
		});

		dispose.dispose();

		return ret;
	}

	download(url: string, target: string, onDidCancel?: () => void): TPromise<string> {
		return this.handle(url, this.nodeDownloadService.download(url, target), onDidCancel);
	}

	downloadTemp(url: string, onDidCancel?: () => void): TPromise<string> {
		return this.handle(url, this.nodeDownloadService.downloadTemp(url), onDidCancel);
	}
}

registerSingleton(IDownloadWithProgressService, DownloadWithProgressService);
