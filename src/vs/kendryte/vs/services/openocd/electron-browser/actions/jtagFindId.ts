import { Action } from 'vs/base/common/actions';
import { ACTION_ID_JTAG_GET_ID, ACTION_LABEL_JTAG_GET_ID } from 'vs/kendryte/vs/base/common/menu/openocd';

import { TPromise } from 'vs/base/common/winjs.base';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { spawn } from 'child_process';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { timeout } from 'vs/base/common/async';
import { ILogService } from 'vs/platform/log/common/log';
import { Writable } from 'stream';
import { DeferredPromise } from 'vs/base/test/common/utils';
import { isLinux, isWindows } from 'vs/base/common/platform';
import { RawCopyAction } from 'vs/kendryte/vs/base/electron-browser/rawClipboardAction';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { OpenUrlAction } from 'vs/kendryte/vs/platform/open/common/openUrlAction';
import { localize } from 'vs/nls';
import { URL_INSTALL_JLINK_DRIVER } from 'vs/kendryte/vs/base/common/urlList';

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
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	jlinkExe(): string {
		if (isWindows) {
			return this.nodePathService.getPackagesPath('jlink/JLink.exe');
		} else if (isLinux) {
			return this.nodePathService.getPackagesPath('jlink/JLinkExe');
		} else {
			return this.nodePathService.getPackagesPath('jlink/JLinkExe');
		}
	}

	async run(event?: any): TPromise<number> {
		const exe = this.jlinkExe();
		this.logService.info('run command: ' + exe);
		const cp = spawn(exe, [], {
			stdio: ['ignore', 'pipe', 'pipe'],
			windowsHide: true,
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
			this.notificationService.notify({
				severity: Severity.Info,
				message: `Found JTag device: ${sn.value()}`,
				source: 'JLink',
				actions: {
					primary: [
						new RawCopyAction(sn.value()),
					],
				},
			},
			);
			const ret = parseInt(sn.value());
			if (!isNaN(ret)) {
				return ret;
			}
		} else {
			let message = 'JTag device not found.\nCheck permission of "read USB device".';
			if (isWindows) {
				message += ' And check libusb driver.';
			}
			this.notificationService.notify({
				severity: Severity.Warning,
				message,
				actions: {
					primary: [this.instantiationService.createInstance(OpenUrlAction, localize('detail', 'Show Detail'), URL_INSTALL_JLINK_DRIVER)],
				},
			});
		}
		throw new Error('Cannot find JTag device S/N.');
	}
}
