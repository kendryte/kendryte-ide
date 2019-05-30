import { INatureProgressStatus } from 'vs/kendryte/vs/platform/config/common/progress';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { createDownloadId, DownloadID, IDownloadTargetInfo } from 'vs/kendryte/vs/services/download/common/download';
import { exists, fileExists, mkdirp, readFile, truncate, unlink, writeFile } from 'vs/base/node/pfs';
import { dirname } from 'vs/base/common/path';
import { IRequestService } from 'vs/platform/request/node/request';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { createWriteStream, WriteStream } from 'fs';
import { IRequestContext } from 'vs/base/node/request';
import { ILogService, MultiplexLogService } from 'vs/platform/log/common/log';
import { defaultConsoleLogger } from 'vs/kendryte/vs/platform/log/node/consoleLogger';
import { wrapActionWithFileLock } from 'vs/kendryte/vs/base/node/fileLock';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { disposableTimeout } from 'vs/base/common/async';
import uuid = require('uuid');

enum State {
	INIT,
	PREPARE,
	PAUSE,
	WORKING,
	ERROR,
	OK,
}

export function loadIdFromResumeFile(url: string, target: string, logger: ILogService): Promise<DownloadID | null> {
	const resumeFile = target + '.partDownloadInfo';
	logger.info('check resume file at ' + resumeFile + '.');
	return wrapActionWithFileLock(resumeFile, logger, async () => {
		if (!await exists(resumeFile)) {
			logger.info('  resume file not exists.');
			return null;
		}
		logger.info('  resume file exists.');
		const partInfo: IDownloadTargetInfo = JSON.parse(await readFile(resumeFile, 'utf8'));
		if (partInfo.url !== url) {
			return null;
		}
		return createDownloadId(partInfo.id.toString());
	});
}

export class DownloadTask extends Disposable {
	private readonly url: string;
	private readonly requestService: IRequestService;

	private readonly _progressEvent = new Emitter<Partial<INatureProgressStatus>>();
	public readonly downloadId: DownloadID;

	private readonly _workingPromise = new DeferredPromise<string>(); // result file path

	private _onBeforeDispose = new Emitter<void>();
	public get onBeforeDispose() { return this._onBeforeDispose.event; };

	private state: State = State.INIT;
	private message = '';
	private partInfo: Pick<IDownloadTargetInfo, Exclude<keyof IDownloadTargetInfo, 'id'>>;

	private readonly target: string;
	private readonly resumeFile: string;
	private readonly _cancel: CancellationTokenSource;

	private fd: WriteStream;

	private readonly logServices: ILogService[];
	private readonly logger: ILogService;

	constructor(
		existsId: DownloadID | null,
		url: string,
		target: string,
		requestService: IRequestService,
	) {
		super();

		this.requestService = requestService;

		this.logServices = [defaultConsoleLogger];
		this.logger = new MultiplexLogService(this.logServices); // NEVER dispose this !!!
		this._register(toDisposable(() => {
			// defaultConsoleLogger.info('# some logger disposing #');
			// this.logger.info('# this download task is disposing. no more log display from current task. #');
			this.logServices.length = 0;
			this.logServices.push(defaultConsoleLogger);
		}));

		this.url = url;
		this.target = target;
		this.resumeFile = target + '.partDownloadInfo';

		this._cancel = this._register(new CancellationTokenSource);

		this._register(this._progressEvent);
		this._register(this._onBeforeDispose);
		this._register(disposableTimeout(this.timeout.bind(this), 1000 * 60 * 5));

		this.downloadId = existsId || createDownloadId(uuid());
	}

	private timeout() {
		if (this.state !== State.ERROR && this.state !== State.OK) {
			this.logger.warn('Timeout downloading: %s', this.url);
			this._handleError(new Error('timeout'));
		}
		this.logger.info('Download cache timeout: %s', this.downloadId, this.target);
		this.dispose();
	}

	addLogTarget(logger: ILogService) {
		if (logger === defaultConsoleLogger) {
			return;
		}
		if (this.logServices.length === 1 && this.logServices[0] === defaultConsoleLogger) {
			this.logServices[0] = logger;
		} else if (this.logServices.indexOf(logger) === -1) {
			this.logServices.push(logger);
		}
	}

	public get progressEvent(): Event<Partial<INatureProgressStatus>> {
		return (listener: (e: Partial<INatureProgressStatus>) => any, thisArgs?: any, disposables?: IDisposable[]) => {
			const result = this._progressEvent.event(listener, thisArgs);
			if (disposables) {
				disposables.push(result);
			}
			this.toDispose.push(result);
			return result;
		};
	}

	private preparePromise: Promise<void>;

	prepare() {
		this.logger.info('Prepare Download:');
		this.logger.info('  From - ' + this.url);
		this.logger.info('  To   - ' + this.target);

		if (this.state !== State.INIT) {
			return this.preparePromise;
		}

		this.state = State.PREPARE;
		this.updateMessage('preparing...');
		return this.preparePromise = this.loadResumeFile(false).then(async (loaded) => {
			if (loaded) {
				await this._init_checkTotal();
			} else { // need create
				await this._init_getTotal();
			}

			this.state = State.PAUSE;
			this.updateMessage('prepared.');
		}).catch((err) => {
			this._handleError(err);
			throw err;
		});
	}

	async start(): Promise<void> {
		switch (this.state) {
			case State.INIT:
				this.logger.info('start: will prepare');
				return this.prepare().then(() => this.start());
			case State.PREPARE:
				this.logger.info('delay start after prepare');
				return this.preparePromise.then(() => this.start());
			case State.PAUSE:
				this.logger.info('_realStart');
				this._realStart();
				return;
			case State.ERROR:
				this.logger.error('download already failed');
				return Promise.reject(new Error('download already failed.'));
		}

		this.logger.info('called start() when status =', State[this.state]);
	}

	private _realStart() {
		this.state = State.WORKING;
		this.updateMessage('starting...');

		let updateTimer: NodeJS.Timer;

		wrapActionWithFileLock(this.target, this.logger, async () => {
			await mkdirp(dirname(this.target));

			const loaded = await this.loadResumeFile(true);
			if (!loaded) {
				return Promise.reject(new Error(`cannot re-load resume file.`));
			}
			if (this.state === State.OK) {
				return;
			}

			updateTimer = setInterval(() => {
				this.triggerCurrentChange();
			}, 2000);

			return this._lockedStart();
		}).then(async () => {
			this._handleSuccess();
			this.flush();
		}, (e) => this._handleError(e)).then(async () => {
			clearInterval(updateTimer);
			if (this.fd) {
				try {
					this.fd.close();
				} catch (e) {
				}
				delete this.fd;
			}
		});
	}

	private _handleSuccess() {
		if (this.state === State.ERROR) {
			return;
		}
		if (this.state !== State.OK) {
			this.logger.info('this.state = State.OK');
			this.updateMessage('download complete!');
			this.state = State.OK;

			this._workingPromise.complete(this.target);
		}
	}

	private _handleError(e: Error) {
		this.logger.error('[task] download error: ', e.message);
		this.updateMessage(e.message);

		if (this.state === State.OK) {
			return;
		}
		if (this.state !== State.ERROR) {
			this.state = State.ERROR;

			this._workingPromise.error(e);
		}
	}

	private async _lockedStart() {
		const partInfo = this.partInfo;

		const requestHeaders = partInfo.total ? {
			'range': `bytes=${partInfo.current}-${partInfo.total}`,
			'if-range': partInfo.check,
		} : {};

		// if (partInfo.etag) {
		// 	requestHeaders['if-none-match'] = partInfo.etag;
		// } else if (partInfo.lastModified) {
		// 	requestHeaders['if-modified-since'] = partInfo.lastModified;
		// }

		this.logger.info('requestHeaders:', requestHeaders);

		this.updateMessage('downloading...');
		const res = await this.requestService.request({
			type: 'GET',
			url: this.url,
			headers: requestHeaders,
			followRedirects: 3,
		}, this._cancel.token);

		if (res.res.statusCode === 200) { // success, but not part response
			this.logger.warn('success, but not part response (200).');
			this.logger.info('headers:', res.res.headers);
			partInfo.current = 0;

			this.triggerCurrentChange();

			this.logger.info('truncate file with w flag...');
			this.fd = createWriteStream(this.target, {
				flags: 'w',
				autoClose: true,
			});
		} else if (res.res.statusCode === 206) {
			this.logger.info('success, 206.');
			this.logger.info('headers:', res.res.headers);

			this.logger.info('append file with a flag...');
			this.fd = createWriteStream(this.target, {
				flags: 'a',
				autoClose: true,
				start: partInfo.current,
			});
		} else { // failed response
			throw new Error(`HTTP: ${res.res.statusCode} HEAD ${this.url}`);
		}

		let sizeCount = 0;
		this.fd.once('close', () => {
			this.logger.info('fd has close (%s bytes write out)', sizeCount);
			delete this.fd;
		});

		this.logger.info('start piping (start at %s)', partInfo.current);
		res.stream.pipe(this.fd);

		res.stream.on('data', (buff: Buffer) => {
			sizeCount += buff.length;
			partInfo.current += buff.length;
		});

		await new Promise((resolve, reject) => {
			this.fd.once('close', resolve);
		});
	}

	flush(): Thenable<void> {
		if (this._cancel.token.isCancellationRequested) {
			this.logger.info('canceled, not flush');
			return Promise.resolve();
		}

		const fileContent = JSON.stringify({ ...this.partInfo, id: this.downloadId }, null, 2);
		this.logger.info(`flush: [${this.resumeFile}]\n-----------------\n${fileContent}\n-----------------`);
		return mkdirp(dirname(this.resumeFile)).then(() => {
			return writeFile(this.resumeFile, fileContent);
		});
	}

	private async _stop() {
		this.logger.info('called _stop');
		await this.flush();
		this._cancel.cancel();
	}

	private async _destroy() {
		this.logger.info('called _destroy');
		this._cancel.cancel();
		await unlink(this.resumeFile);
		await unlink(this.target);
	}

	async stop() {
		await this._stop();
		this.dispose();
	}

	async destroy() {
		await this._stop();
		await this._destroy();
		this.dispose();
	}

	async getProgress(): Promise<INatureProgressStatus> {
		const part = await this.partInfo;
		if (!part) {
			return {
				message: this.message,
				total: NaN,
				current: 0,
			};
		}
		return {
			message: this.message,
			total: part.total,
			current: part.current,
		};
	}

	getInfo(): IDownloadTargetInfo {
		if (this.state === State.INIT || this.state === State.PREPARE) {
			throw new Error('getInfo(): task not resumed, please call prepare()');
		}
		return { ...this.partInfo, id: this.downloadId };
	}

	private async _init_getTotal(): Promise<void> {
		this.partInfo = { id: this.downloadId } as any;
		const resp = await this.requestService.request({
			type: 'HEAD',
			url: this.url,
			followRedirects: 3,
		}, this._cancel.token);
		this._parsePartInfoFromResponse(resp);
		this.logger.info(`flush: [${this.resumeFile}] ${JSON.stringify(this.partInfo, null, 2)}`);
		await this.flush();
	}

	private _parsePartInfoFromResponse(resp: IRequestContext) {
		this.logger.info('response:', resp.res.statusCode, resp.res.headers);
		const partInfo = this.partInfo;
		if (resp.res.statusCode !== 200) {
			this.logger.warn('request HEAD got error: ', resp.res.statusCode);
			throw new Error(`HTTP: ${resp.res.statusCode} HEAD ${this.url}`);
		}

		if (getFirstHeader(resp.res.headers, 'accept-ranges') === 'bytes') {
			partInfo.total = parseInt(getFirstHeader(resp.res.headers, 'content-length'));
			this.logger.info('request HEAD got size: ', partInfo.total);
		} else {
			partInfo.total = NaN;
			this.logger.info('request HEAD got not support ranges: NaN');
		}

		partInfo.current = 0;

		partInfo.etag = getFirstHeader(resp.res.headers, 'etag') || '';
		partInfo.lastModified = getFirstHeader(resp.res.headers, 'last-modified') || '';
		partInfo.check = partInfo.etag || partInfo.lastModified;
		this.logger.info('request HEAD got hash: ', partInfo.check);
	}

	private loadResumeFile(starting: boolean): Promise<boolean> {
		return wrapActionWithFileLock(this.resumeFile, this.logger, async () => {
			if (await fileExists(this.resumeFile)) {
				this.logger.info('resume file exists: ' + this.resumeFile);
				if (!starting && !await fileExists(this.target)) {
					this.logger.warn('  resume file exists but target file not.');
					return false;
				}
				try {
					const partInfo: IDownloadTargetInfo = JSON.parse(await readFile(this.resumeFile, 'utf8'));
					partInfo.total = parseInt(partInfo.total as any); // prevent NaN

					this.logger.info('resume state by: ', partInfo);
					if (partInfo.total && partInfo.current === partInfo.total) {
						if (starting) {
							this._handleSuccess();
						}
					} else {
						if (!partInfo.total) {
							partInfo.total = NaN;
							partInfo.current = 0;
						}
					}

					this.partInfo = partInfo;
					return true;
				} catch (e) {
					this.logger.error('resume file [' + this.resumeFile + '] parse failed: ', e);
					return false;
				}
			} else {
				this.logger.info('resume file NOT exists.');
				return false;
			}
		});
	}

	private async _init_checkTotal() {
		const partInfo = this.partInfo;
		if (!partInfo.total || !partInfo.check) {
			return;
		}
		const headers: any = {};

		if (partInfo.etag) {
			headers['if-none-match'] = partInfo.etag;
		} else if (partInfo.lastModified) {
			headers['if-modified-since'] = partInfo.lastModified;
		}

		this.logger.info('check remote changed: ', headers);
		const resp = await this.requestService.request({
			type: 'HEAD',
			url: this.url,
			headers,
			followRedirects: 3,
		}, this._cancel.token);

		if (resp.res.statusCode === 304) {
			this.logger.info('  -> NOT changed. continue download.');
			return;
		}

		this.logger.info('  -> changed! reset download status.');
		await truncate(this.target, 0);

		this._parsePartInfoFromResponse(resp);
		await this.flush();
	}

	private updateMessage(message: string) {
		this.message = message;
		this.logger.info('[DOWNLOAD] %s', message);
		this.getProgress().then(p => this._progressEvent.fire(p));
	}

	private triggerCurrentChange() {
		this.getProgress().then(p => {
			this.logger.trace(`progress = ${p.current}/${p.total}`);
			this._progressEvent.fire(p);
			return this.flush();
		});
	}

	public dispose(): void {
		this.logger.info('download is disposing...');
		if (this.state !== State.ERROR && this.state !== State.OK) {
			this._handleError(new Error('Canceled'));
		}
		this._onBeforeDispose.fire();
		super.dispose();
		this.logger.info('download is disposed...');

		delete this._onBeforeDispose;
	}

	public whenFinish() {
		return this._workingPromise.p;
	}
}

function getFirstHeader(headers: IRequestContext['res']['headers'], key: string): string {
	if (headers[key]) {
		return Array.isArray(headers[key]) ? headers[key][0] : headers[key];
	} else {
		return '';
	}
}