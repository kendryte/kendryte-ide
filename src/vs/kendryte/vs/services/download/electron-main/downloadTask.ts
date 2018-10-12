import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { echo, Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IDownloadTargetInfo } from 'vs/kendryte/vs/services/download/common/download';
import { fileExists, mkdirp, readFile, unlink, writeFile } from 'vs/base/node/pfs';
import { dirname } from 'vs/base/common/paths';
import { IRequestService } from 'vs/platform/request/node/request';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { lock as rawLock, unlock as rawUnlock } from 'proper-lockfile';
import { createWriteStream, WriteStream } from 'fs';
import { hash } from 'vs/base/common/hash';
import { INodePathService } from 'vs/kendryte/vs/platform/common/type';
import { IRequestContext } from 'vs/base/node/request';
import uuid = require('uuid');

enum State {
	INIT,
	PREPARE,
	PAUSE,
	WORKING,
	ERROR,
	OK,
}

export class DownloadTask extends Disposable {
	private readonly url: string;
	private readonly requestService: IRequestService;
	private readonly nodePathService: INodePathService;

	private readonly _progressEvent = new Emitter<Partial<INatureProgressStatus>>();
	private readonly _finishEvent = new Emitter<[string, Error]>();
	public readonly finishEvent = echo(this._finishEvent.event);

	private state: State = State.INIT;
	private message = '';
	private partInfo: IDownloadTargetInfo;

	private readonly target: string;
	private readonly resumeFile: string;
	private readonly _cancel: CancellationTokenSource;

	private fd: WriteStream;

	constructor(
		url: string,
		target: string,
		requestService: IRequestService,
		nodePathService: INodePathService,
	) {
		super();

		this.requestService = requestService;
		this.nodePathService = nodePathService;

		// console.log('Download:\n  %s\nTo:\n  %s', url, target);

		this.url = url;
		this.target = target;
		this.resumeFile = target + '.partDownloadInfo';

		this._cancel = new CancellationTokenSource;

		this._register(this._progressEvent);
		this._register(this._finishEvent);
	}

	public get progressEvent(): Event<Partial<INatureProgressStatus>> {
		return (listener: (e: Partial<INatureProgressStatus>) => any, thisArgs?: any, disposables?: IDisposable[]) => {
			const result = this.progressEvent(listener, thisArgs);
			if (disposables) {
				disposables.push(result);
			}
			this.toDispose.push(result);
			return result;
		};
	}

	private _wrapActionPromise<T>(lockFile: string, pc: () => Thenable<T>): Promise<T> {
		return this.lock(lockFile).then(pc).then((r) => {
			return this.unlock(lockFile).then(() => r);
		}, (e) => {
			return this.unlock(lockFile).then(() => {
				throw e;
			});
		});
	}

	private async lock(f: string) {
		const lockFile = this.nodePathService.tempDir('L' + hash(f));
		// console.log('lock [%s] -> %s', f, lockFile);
		if (!await fileExists(lockFile)) {
			await mkdirp(dirname(lockFile));
			// console.log('    the lock file not exists, create it.');
			await writeFile(lockFile, 'empty', {});
		}
		await rawLock(lockFile);
	}

	private async unlock(f: string) {
		const lockFile = this.nodePathService.tempDir('L' + hash(f));
		// console.log('unlock [%s] -> %s', f, lockFile);
		if (!await fileExists(lockFile)) {
			// console.log('    the lock file not exists, no need release.');
			return;
		}
		await rawUnlock(lockFile);
		await unlink(lockFile);
	}

	private preparePromise: Promise<void>;

	public prepare(): Promise<void> {
		if (this.state !== State.INIT) {
			return this.preparePromise;
		}

		this.state = State.PREPARE;
		this.updateMessage('preparing...');
		return this.preparePromise = this.loadResumeFile().then(async (loaded) => {
			if (this.state === State.OK) {
				return;
			}
			if (loaded) {
				await this._init_checkTotal();
			} else { // need create
				await this._init_getTotal();
			}

			this.state = State.PAUSE;
		}).catch((err) => {
			this._handleError(err);
			throw err;
		});
	}

	async start(): Promise<void> {
		switch (this.state) {
			case State.INIT:
				return this.prepare().then(() => this.start());
			case State.PREPARE:
				// console.log('delay start after prepare');
				return this.preparePromise.then(() => this.start());
			case State.PAUSE:
				this._realStart();
				return;
			case State.ERROR:
				return Promise.reject(new Error('download already failed.'));
		}
	}

	private _realStart() {
		this.state = State.WORKING;
		this.updateMessage('starting...');

		let updateTimer: number;

		this._wrapActionPromise(this.target, async () => {
			const loaded = await this.loadResumeFile();
			if (!loaded) {
				throw new Error(`cannot re-load resume file.`);
			}
			if (this.state === State.OK) {
				return;
			}

			updateTimer = setInterval(() => {
				this.triggerCurrentChange();
			}, 2000);

			return this._lockedStart();
		}).then(() => this._handleSuccess(), (e) => this._handleError(e)).then(async () => {
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

	private async _handleSuccess() {
		// console.log('OK!!');
		await this.flush();
		this.updateMessage('download complete!');
		this._handleFireSuccess();
	}

	private _handleFireSuccess() {
		if (this.state !== State.OK && this.state !== State.ERROR) {
			// console.log('this.state = State.OK');
			this.state = State.OK;
			this._finishEvent.fire([this.target, null]);
		}
	}

	private _handleError(e) {
		// console.log('ERR!!', e);
		this.updateMessage(e.message);
		if (this.state !== State.OK && this.state !== State.ERROR) {
			this.state = State.ERROR;
			this._finishEvent.fire([null, e]);
		}
	}

	private async _lockedStart() {
		const partInfo: IDownloadTargetInfo = this.partInfo;

		if (!await fileExists(this.target)) {
			await writeFile(this.target, Buffer.alloc(0), {});
		}

		this.updateMessage('downloading...');
		const res = await this.requestService.request({
			type: 'GET',
			url: this.url,
			headers: partInfo.total ? {
				'range': `bytes=${partInfo.current}-${partInfo.total}`,
				'if-range': partInfo.check,
			} : {},
			followRedirects: 3,
		}, this._cancel.token);

		if (res.res.statusCode === 200) { // success, but not part response
			// console.log('success, but not part response.', res.res.headers);
			partInfo.current = 0;
			this.triggerCurrentChange();
		} else if (res.res.statusCode === 206) {
			// console.log('success, 206.', res.res.headers);
		} else { // faield response
			throw new Error(`HTTP: ${res.res.statusCode} HEAD ${this.url}`);
		}

		this.fd = createWriteStream(this.target, {
			flags: 'r+',
			autoClose: true,
			start: partInfo.current,
		});
		this.fd.once('close', () => {
			// console.log('fd has close');
			delete this.fd;
		});

		// console.log('start piping');
		res.stream.pipe(this.fd);

		res.stream.on('data', (buff: Buffer) => {
			partInfo.current += buff.length;
		});

		await new Promise((resolve, reject) => {
			this.fd.once('close', resolve);
		});
	}

	flush(): Thenable<void> {
		if (this._cancel.token.isCancellationRequested) {
			// console.log('canceled, not flush');
			return Promise.resolve();
		}

		// console.log('flush: %j [%s]', this.partInfo, this.resumeFile);
		return writeFile(this.resumeFile, JSON.stringify(this.partInfo));
	}

	private async _stop() {
		// console.log('called _stop');
		await this.flush();
		this._cancel.cancel();
	}

	private async _destroy() {
		// console.log('called _destroy');
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

	getInfo() {
		if (this.state === State.INIT || this.state === State.PREPARE) {
			throw new Error('not ready, please call prepare()');
		}
		return this.partInfo;
	}

	private async _init_getTotal(): Promise<void> {
		this.partInfo = { id: { __id: uuid() } } as any;
		const resp = await this.requestService.request({
			type: 'HEAD',
			url: this.url,
			followRedirects: 3,
		}, this._cancel.token);
		this._parsePartInfoFromResponse(resp);
		await this.flush();
	}

	private _parsePartInfoFromResponse(resp: IRequestContext) {
		const partInfo = this.partInfo;
		if (resp.res.statusCode !== 200) {
			// console.log('request HEAD got error: ', resp.res.statusCode);
			throw new Error(`HTTP: ${resp.res.statusCode} HEAD ${this.url}`);
		}

		if (getFirstHeader(resp.res.headers, 'accept-ranges') === 'bytes') {
			partInfo.total = parseInt(getFirstHeader(resp.res.headers, 'content-length'));
			// console.log('request HEAD got size: ', partInfo.total);
		} else {
			partInfo.total = NaN;
			// console.log('request HEAD got not support ranges: NaN');
		}

		partInfo.current = 0;

		partInfo.etag = getFirstHeader(resp.res.headers, 'etag') || '';
		partInfo.lastModified = getFirstHeader(resp.res.headers, 'last-modified') || '';
		partInfo.check = partInfo.etag || partInfo.lastModified;
		// console.log('request HEAD got hash: ', partInfo.check);
	}

	private loadResumeFile(): Promise<boolean> {
		return this._wrapActionPromise(this.resumeFile, async () => {
			if (await fileExists(this.resumeFile)) {
				// console.log('resume file exists.');
				try {
					const partInfo = JSON.parse(await readFile(this.resumeFile, 'utf8'));
					partInfo.total = parseInt(partInfo.total as any); // prevent NaN

					// console.log('resume state by: ', partInfo);
					if (partInfo.total && partInfo.current === partInfo.total) {
						this._handleFireSuccess();
					} else {
						if (!partInfo.total) {
							partInfo.total = NaN;
							partInfo.current = 0;
						}
					}

					this.partInfo = partInfo;
					return true;
				} catch (e) {
					// console.log('resume file parse failed: ', e);
					return false;
				}
			} else {
				// console.log('resume file NOT exists.');
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

		// console.log('check remote changed: ', headers);
		const resp = await this.requestService.request({
			type: 'HEAD',
			url: this.url,
			headers,
			followRedirects: 3,
		}, this._cancel.token);

		if (resp.res.statusCode === 304) {
			// console.log('    remote file NOT changed');
			return;
		}

		// console.log('    remote file HAS changed');
		this._parsePartInfoFromResponse(resp);
		await this.flush();
	}

	private updateMessage(message: string) {
		this.message = message;
		// console.log('message = ', message);
		this.getProgress().then(p => this._progressEvent.fire(p));
	}

	private triggerCurrentChange() {
		this.getProgress().then(p => {
			// console.log('progress = %s/%s', p.current, p.total);
			this._progressEvent.fire(p);
			return this.flush();
		});
	}
}

function getFirstHeader(headers: IRequestContext['res']['headers'], key: string): string {
	if (headers[key]) {
		return Array.isArray(headers[key]) ? headers[key][0] : headers[key];
	} else {
		return '';
	}
}