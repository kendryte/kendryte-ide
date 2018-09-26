import * as wss from 'vs/platform/windows/electron-main/windowsService';
import { isLinux } from 'vs/base/common/platform';
import { TPromise } from 'vs/base/common/winjs.base';
import { app, clipboard } from 'electron';
import { mnemonicButtonLabel } from 'vs/base/common/labels';
import * as nls from 'vs/nls';
import product from 'vs/platform/node/product';
import { ILogService } from 'vs/platform/log/common/log';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { exists, readFile } from 'vs/base/node/pfs';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolvePath } from 'kendryte/vs/platform/node/resolvePath';

class WrappedWindowsService extends wss.WindowsService {
	async openAboutDialog(): TPromise<void> {
		const windowsMainService = (this as any).windowsMainService as IWindowsMainService;
		const logService = (this as any).logService as ILogService;
		const environmentService = (this as any).environmentService as IEnvironmentService;

		logService.trace('windowsService#openAboutDialog');
		const lastActiveWindow = windowsMainService.getFocusedWindow() || windowsMainService.getLastActiveWindow();

		let version = app.getVersion();

		if (product.target) {
			version = `${version} (${product.target} setup)`;
		}

		let versionsFile = '';
		if (environmentService.isBuilt) {
			versionsFile = resolvePath(environmentService.execPath, '..', 'packages/versions.json');
		} else {
			versionsFile = resolvePath(environmentService.execPath, '../../..', 'packages/versions.json');
		}

		console.log(`versionsFile=${versionsFile}`);

		let patchVersion = 'Unknown';
		let packagesVersions = '';
		if (await exists(versionsFile)) {
			const updateInfo = JSON.parse(await readFile(versionsFile, 'utf8'));
			if (updateInfo['hot-patch-version']) {
				patchVersion = updateInfo['hot-patch-version'];
			}
			for (const pack of Object.keys(updateInfo)) {
				if (/^\./.test(pack)) {
					continue;
				}
				const ver = updateInfo[pack];

				packagesVersions += `\n${pack}: ${ver}`;
			}
		}

		let detail = nls.localize(
			'myAboutDetail',
			'KendryteIDE: {0}\nUpdate: {1}\nPatch: {2}\nDate: {3}\nElectron: {4}\nChrome: {5}\nNode.js: {6}\nV8: {7}\nArchitecture: {8}',
			version,
			product.commit || 'Unknown',
			patchVersion,
			product.date || 'Unknown',
			process.versions['electron'],
			process.versions['chrome'],
			process.versions['node'],
			process.versions['v8'],
			process.platform + ' ' + process.arch,
		);
		detail += '\n--------' + packagesVersions;

		const ok = nls.localize('okButton', 'OK');
		const copy = mnemonicButtonLabel(nls.localize({ key: 'copy', comment: ['&& denotes a mnemonic'] }, '&&Copy'));
		let buttons: string[];
		if (isLinux) {
			buttons = [copy, ok];
		} else {
			buttons = [ok, copy];
		}

		await windowsMainService.showMessageBox({
			title: product.nameLong,
			type: 'info',
			message: product.nameLong,
			detail: `\n${detail}`,
			buttons,
			noLink: true,
			defaultId: buttons.indexOf(ok),
		}, lastActiveWindow).then(result => {
			if (buttons[result.button] === copy) {
				clipboard.writeText(detail);
			}
		});
	}
}

Object.assign(wss, {
	WindowsService: WrappedWindowsService,
});
