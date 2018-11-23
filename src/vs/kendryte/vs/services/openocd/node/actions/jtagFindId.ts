import { Action } from 'vs/base/common/actions';
import { ACTION_ID_JTAG_GET_ID, ACTION_LABEL_JTAG_GET_ID } from 'vs/kendryte/vs/base/common/menu/openocd';

import { TPromise } from 'vs/base/common/winjs.base';
import { executableExtension } from 'vs/kendryte/vs/base/common/platformEnv';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { spawn } from 'child_process';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { timeout } from 'vs/base/common/async';
import { ILogService } from 'vs/platform/log/common/log';
import { Writable } from 'stream';
import { DeferredPromise } from 'vs/base/test/common/utils';

const snReg = /^S\/N: (\d+)/m;

export class MatchingStream extends Writable {
	private buffer = '';
	private found = false;
	private foundDfd = new DeferredPromise();
	private result: string;

	_write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void {
		if (this.found) {
			callback();
			return;
		}
		if (!encoding) {
			encoding = 'utf8';
		} else if (encoding === 'buffer') {
			encoding = 'utf8';
		}
		this.buffer += chunk.toString(encoding);

		const m = snReg.exec(this.buffer);
		if (m) {
			this.found = true;
			delete this.buffer;
			this.result = m[1];
			this.foundDfd.complete(void 0);
		}
		callback();
	}

	value() {
		return this.result;
	}

	promise() {
		return this.foundDfd.p;
	}
}

export class DetectJTagIdAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_GET_ID;
	public static readonly LABEL = ACTION_LABEL_JTAG_GET_ID;

	constructor(
		id: string, label: string,
		@INodePathService private readonly nodePathService: INodePathService,
		@INotificationService private readonly notificationService: INotificationService,
		@ILogService private readonly logService: ILogService,
	) {
		super(id, label);
	}

	async run(event?: any): TPromise<number> {
		const exe = this.nodePathService.getPackagesPath('openocd/JLinkExe' + executableExtension);
		this.logService.info('run command: ' + exe);
		const cp = spawn(exe, [], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		const sn = new MatchingStream();
		cp.stdout.pipe(sn, { end: false });
		cp.stderr.pipe(sn, { end: false });

		await Promise.race([
			sn.promise(),
			timeout(3000),
		]);

		cp.kill();
		sn.end('');

		if (sn.value()) {
			this.notificationService.info(`Found JTag device: ${sn.value()}`);
			const ret = parseInt(sn.value());
			if (!isNaN(ret)) {
				return ret;
			}
		} else {
			this.notificationService.warn(`JTag device not found, maybe you do not have permission to access USB.`);
		}
		throw new Error('Cannot find JTag device S/N.');
	}
}
