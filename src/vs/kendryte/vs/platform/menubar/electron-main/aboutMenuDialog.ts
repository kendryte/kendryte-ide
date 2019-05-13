import * as wss from 'vs/platform/windows/electron-main/windowsService';
import { isLinux } from 'vs/base/common/platform';
import { app, clipboard } from 'electron';
import { mnemonicButtonLabel } from 'vs/base/common/labels';
import * as nls from 'vs/nls';
import product from 'vs/platform/product/node/product';
import { ILogService } from 'vs/platform/log/common/log';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { exists, readFile } from 'vs/base/node/pfs';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IDECurrentPatchVersion } from 'vs/kendryte/vs/platform/vscode/node/myVersion';

class TinyNodePathService {
	constructor(
		private readonly environmentService: IEnvironmentService,
	) {
	}

	getDataPath() {
		if (process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR) {
			return resolvePath(process.env.KENDRYTE_IDE_LOCAL_PACKAGE_DIR);
		}
		if (this.environmentService.isBuilt) {
			return resolvePath(this.getSelfControllingRoot(), '../../LocalPackage');
		} else {
			return resolvePath(this.getSelfControllingRoot(), '../kendryte-ide-shell/build/DebugContents/LocalPackage');
		}
	}

	getSelfControllingRoot() {
		if (!this.environmentService.isBuilt) {
			// when dev, source code is always version control root
			return resolvePath(this.environmentService.appRoot);
		}

		return resolvePath(this.environmentService.appRoot, '../..');
	}
}

class WrappedWindowsService extends wss.WindowsService {

	async openAboutDialog(): Promise<void> {
		const windowsMainService = (this as any).windowsMainService as IWindowsMainService;
		const logService = (this as any).logService as ILogService;
		const environmentService = (this as any).environmentService as IEnvironmentService;

		logService.trace('windowsService#openAboutDialog');
		const lastActiveWindow = windowsMainService.getFocusedWindow() || windowsMainService.getLastActiveWindow();

		let version = app.getVersion();

		if (product.target) {
			version = `${version} (${product.target} setup)`;
		}

		let patchVersion = IDECurrentPatchVersion();
		let packagesVersions = '';

		const nodePathService = new TinyNodePathService(environmentService);
		const versionsFile = resolvePath(nodePathService.getDataPath(), 'bundled-versions.json');
		console.log(`versionsFile=${versionsFile}`);

		if (await exists(versionsFile)) {
			packagesVersions = '';
			const updateInfo = JSON.parse(await readFile(versionsFile, 'utf8'));
			for (const pack of Object.keys(updateInfo)) {
				if (/^\./.test(pack)) {
					continue;
				}
				const ver = updateInfo[pack];

				packagesVersions += `\n${pack}: ${ver}`;
			}
		} else {
			packagesVersions += `\nmissing packages versions.\n${versionsFile}`;
		}

		let detail = nls.localize(
			'myAboutDetail',
			'VS Code: {0}\nKendryte IDE: {1}\nCommit: {2}\nElectron: {4}\nChrome: {5}\nNode.js: {6}\nV8: {7}\nArchitecture: {8}',
			version + (environmentService.isBuilt ? ' (from source)' : ''),
			patchVersion,
			product.commit || 'Unknown',
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
