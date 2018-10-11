import { INatureProgressStatus } from 'vs/kendryte/vs/platform/common/progress';
import { echo, Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { DownloadID } from 'vs/kendryte/vs/services/download/common/download';
import { fileExists, mkdirp, readFile, unlink, writeFile } from 'vs/base/node/pfs';
import { dirname } from 'vs/base/common/paths';
import { TPromise } from 'vs/base/common/winjs.base';
import { IRequestService } from 'vs/platform/request/node/request';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { lock as rawLock, unlock as rawUnlock } from 'proper-lockfile';
import { createWriteStream, WriteStream } from 'fs';
import { hash } from 'vs/base/common/hash';
import { INodePathService } from 'vs/kendryte/vs/platform/common/type';
import { IRequestContext } from 'vs/base/node/request';
import uuid = require('uuid');

enum State {
	PREPARE,
	PAUSE,
	WORKING,
	ERROR,
	OK,
}

interface IPartDownload {
	id: DownloadID;
	total: number;
	current: number;
	check: string;
}

export class DownloadTask extends Disposable {
	private readonly url: string;
	private readonly requestService: IRequestService;
	private readonly nodePathService: INodePathService;

	private readonly _progressEvent = new Emitter<Partial<INatureProgressStatus>>();
	public readonly progressEvent = this._progressEvent.event;
	private readonly _finishEvent = new Emitter<[string, Error]>();
	public readonly finishEvent = echo(this._finishEvent.event);

	private state: State;
	private message = '';
	private partInfo: TPromise<IPartDownload>;
	private errorPromise: TPromise<never>;

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

		this.partInfo = this.prepare().then(undefined, (err) => {
			this._handleError(err);
			return null;
		});

		this.partInfo.then(() => this.flush());
	}

	private async lock(f: string) {
		const lockFile = this.nodePathService.tempDir('L' + hash(f));
		// console.log('lock [%s] -> %s', f, lockFile);
		if (!await fileExists(lockFile)) {
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

	private async prepare(): TPromise<IPartDownload> {
		this.state = State.PREPARE;

		this.updateMessage('preparing...');
		let partInfo: IPartDownload;

		await mkdirp(dirname(this.resumeFile));

		await this.lock(this.resumeFile);
		if (await fileExists(this.resumeFile)) {
			// console.log('resume file exists.');
			partInfo = JSON.parse(await readFile(this.resumeFile, 'utf8'));
			partInfo.total = parseInt(partInfo.total as any); // prevent NaN
		} else {
			// console.log('resume file NOT exists.');
			partInfo = {
				id: { __id: uuid() },
				current: 0,
			} as any;

			await this.getTotal(partInfo);
		}
		this.resumeState(partInfo);

		await this.unlock(this.resumeFile);
		return partInfo;
	}

	start(): any {
		switch (this.state) {
			case State.PREPARE:
				// console.log('delay start after prepare');
				return this.partInfo.then(() => this.start());
			case State.PAUSE:
				return this._realStart();
		}
	}

	private async _realStart() {
		this.state = State.WORKING;
		this.updateMessage('starting...');

		let updateTimer: number;

		this.lock(this.target).then(async (e) => {
			const partInfo = JSON.parse(await readFile(this.resumeFile, 'utf8'));

			this.resumeState(partInfo, State.WORKING);
			if (this.state !== State.WORKING) { // must be success
				return;
			}

			this.partInfo = TPromise.as(partInfo);

			updateTimer = setInterval(() => {
				this.triggerCurrentChange();
			}, 2000);

			return this._lockedStart(partInfo);
		}).then(() => this._handleSuccess(), (e) => this._handleError(e)).then(async () => {
			clearInterval(updateTimer);
			await this.unlock(this.target);
			if (this.fd) {
				this.fd.close();
				delete this.fd;
			}
		});
	}

	private async _handleSuccess() {
		// console.log('OK!!');
		await this.flush();
		this.state = State.OK;
		this.updateMessage('complete!');
		this._finishEvent.fire([this.target, null]);
	}

	private _handleError(e) {
		// console.log('ERR!!', e);
		this.errorPromise = TPromise.wrapError(e);
		this.state = State.ERROR;
		this.updateMessage(e.message);
		this._finishEvent.fire([null, e]);
	}

	private async _lockedStart(partInfo: IPartDownload) {
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

	async flush(): TPromise<void> {
		if (this._cancel.token.isCancellationRequested) {
			// console.log('canceled, not flush');
			return;
		}
		if (this.state === State.ERROR) {
			// console.log('failed, not flush');
			return this.errorPromise;
		}

		// console.log('flush: %j [%s]', await this.partInfo, this.resumeFile);
		await writeFile(this.resumeFile, JSON.stringify(await this.partInfo));
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

	async getProgress(): TPromise<INatureProgressStatus> {
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

	async getId() {
		if (this.state === State.ERROR) {
			return this.errorPromise;
		}
		if (!this.partInfo) {
			throw new TypeError('impossible error.');
		}
		return (await this.partInfo).id;
	}

	private async getTotal(partInfo: IPartDownload): TPromise<void> {
		const resp = await this.requestService.request({
			type: 'HEAD',
			url: this.url,
			followRedirects: 3,
		}, this._cancel.token);

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

		partInfo.check = getFirstHeader(resp.res.headers, 'etag') || getFirstHeader(resp.res.headers, 'last-modified') || '';
		// console.log('request HEAD got hash: ', partInfo.check);
	}

	private resumeState(partInfo: IPartDownload, notFinishedState = State.PAUSE) {
		// console.log('resume state by: ', partInfo);
		if (partInfo.total && partInfo.current === partInfo.total) {
			this.state = State.OK;
			this._finishEvent.fire([this.target, null]);
			// console.log('this.state = State.OK');
		} else {
			this.state = notFinishedState;
			// console.log('this.state = %s', State[notFinishedState]);
		}
	}

	private updateMessage(message: string) {
		this.message = message;
		// console.log('message = ', message);
		if (!this.partInfo) {
			return;
		}
		this.getProgress().then(p => this._progressEvent.fire(p));
	}

	private triggerCurrentChange() {
		if (!this.partInfo) {
			return;
		}
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