import { TPromise } from 'vs/base/common/winjs.base';
import { resolve as resolveUrl } from 'url';
import { IIDEBuildingBlocksService, UpdateList, UpdateListFulfilled } from 'vs/kendryte/vs/services/update/common/type';
import { copy, exists, readFile, rimraf, unlink, writeFile } from 'vs/base/node/pfs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as crypto from 'crypto';
import { dumpDate } from 'vs/kendryte/vs/base/common/dumpDate';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILifecycleService } from 'vs/platform/lifecycle/electron-main/lifecycleMain';
import { IBuildingBlocksUpdateInfo, REQUIRED_BLOCK_DISTRIBUTE_URL } from 'vs/kendryte/vs/services/update/common/protocol';
import { INodeDownloadService } from 'vs/kendryte/vs/services/download/common/download';
import { IVersionUrlHandler } from 'vs/kendryte/vs/services/update/node/versionUrlHandler';
import { buffer, Emitter } from 'vs/base/common/event';
import { app, BrowserWindow } from 'electron';
import { isWindows } from 'vs/base/common/platform';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { format } from 'util';

const STORAGE_KEY = 'block-update';

const LAST_UPDATE_CACHE_KEY = STORAGE_KEY + '-last-update';

class IDEBuildingBlocksService implements IIDEBuildingBlocksService {
	public _serviceBrand: any;

	private running: TPromise<UpdateList>;
	private bundledVersions: { [packageName: string]: string };

	private readonly _onProgress = new Emitter<string>();
	private currentStatus: string = '';
	private readonly packageBundleFile: string;

	constructor(
		@IVersionUrlHandler private readonly versionHandler: IVersionUrlHandler,
		@IStorageService private storageService: IStorageService,
		@INodePathService private nodePathService: INodePathService,
		@ILifecycleService private lifecycleService: ILifecycleService,
		@IInstantiationService instantiationService: IInstantiationService,
		@INodeDownloadService private downloadService: INodeDownloadService,
	) {
		this.packageBundleFile = this.nodePathService.getPackagesPath('bundled-versions.json');
	}

	public get onProgress() {
		return buffer(this._onProgress.event, false, [this.currentStatus]);
	}

	protected setMessage(msg: string) {
		this.currentStatus = msg;
		this._onProgress.fire(msg);
	}

	async realRunUpdate(data: UpdateListFulfilled) {
		if (await exists(this.packageBundleFile)) {
			await unlink(this.packageBundleFile);
		}

		if (!this.bundledVersions) {
			this.bundledVersions = {};
		}

		app.once('will-quit', (e: Event) => {
			e.preventDefault();

			const win = this._showNotify();
			const logg = (message: string, ...args: any[]) => {
				const msg = format(message, ...args);
				console.log(msg);
				win.webContents.executeJavaScript(`doLog(${JSON.stringify(msg)})`).catch();
			};

			const finish = () => {
				debugger;
				logg('### relaunch');
				setTimeout(() => {
					win.destroy();
					app.relaunch();
					app.quit();
				}, 2000);
			};

			this.handleQuit(data, logg).catch((e) => {
				console.error(e);
				logg('Failed with ' + e.message);
				alert('Error while moving files: ' + e.message);
			}).then(finish);
		});

		this.lifecycleService.quit().then(() => {
		});
	}

	public fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		if (!this.running) {
			this.running = this._fetchUpdateInfo(logger, force).then((r) => {
				delete this.running;
				return r;
			}, (e) => {
				delete this.running;
				throw e;
			});
		}
		return this.running;
	}

	private async _fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		logger.info('MAIN::fetchUpdateInfo:');
		if (!force && await this.isUpdateAlreadyCheckedMomentsAgo(logger)) {
			logger.info('update check too fast, skip this time.');
			return [];
		}

		if (await exists(this.packageBundleFile)) {
			logger.info('read bundle file versions...');
			this.bundledVersions = JSON.parse(await readFile(this.packageBundleFile, 'utf8'));
		} else {
			logger.info('bundle file not exists...');
			this.bundledVersions = {};
		}
		const regUrl = resolveUrl(REQUIRED_BLOCK_DISTRIBUTE_URL + '/', 'projects.json');
		logger.info('fetching registry: ' + regUrl);
		const id = await this.downloadService.downloadTemp(regUrl, true, logger);
		const file = await this.downloadService.waitResultFile(id);
		logger.info('fetching registry complete.');
		logger.info('\t' + file);
		const content: IBuildingBlocksUpdateInfo[] = JSON.parse(await readFile(file, 'utf8'));

		const needUpdate: UpdateList = [];
		let i = 1;
		for (const packageData of content) {
			logger.info(` * ${packageData.projectName}: (${i++}/${content.length})`);
			if (packageData.version === this.bundledVersions[packageData.projectName]) {
				logger.info(`up to date: ` + packageData.version);
				continue;
			}

			logger.info(`need update! local [${this.bundledVersions[packageData.projectName] || 'uninstall'}] remote [${packageData.version}].`);
			let downloadUrl = this.versionHandler.getMyVersion(packageData);
			logger.info(`url = ${downloadUrl}`);
			downloadUrl = resolveUrl(REQUIRED_BLOCK_DISTRIBUTE_URL + '/', downloadUrl);
			logger.info(`url = ${downloadUrl}`);

			needUpdate.push({
				name: packageData.projectName,
				version: packageData.version,
				downloadUrl: downloadUrl,
			});
		}
		logger.debug('need update:', needUpdate);
		return needUpdate;
	}

	protected async checkHashIfKnown(hash: string, file: string, logger: IChannelLogger) {
		const alreadyExists = await exists(file);
		if (hash && alreadyExists) {
			const downloadedHash = (await this.hashFile(file)).toLowerCase();
			if (downloadedHash !== hash.toLowerCase()) {
				logger.error('hash invalid!\nexpect: %s\ngot   : %s', hash.toLowerCase(), downloadedHash);
				unlink(file);
				return false;
			}
			logger.info('hash check pass.');
			return true;
		} else {
			if (alreadyExists) {
				logger.info('hash is not set, skip check.');
			}
			return alreadyExists;
		}
	}

	protected async hashFile(file: string) {
		return crypto.createHash('md5').update(await readFile(file)).digest('hex');
	}

	protected async isUpdateAlreadyCheckedMomentsAgo(logger: IChannelLogger): TPromise<boolean> {
		const lastUpdate = this.storageService.getInteger(LAST_UPDATE_CACHE_KEY, StorageScope.GLOBAL, -1);
		if (lastUpdate <= 0) {
			logger.info('update has never checked');
			return false;
		}
		const lastDate = new Date(lastUpdate);
		logger.info('last update checked: %s', dumpDate.time(lastDate));
		if (isNaN(lastDate.getTime())) {
			logger.info('update time invalid');
			return false;
		}

		const mustRecheck = lastDate;
		mustRecheck.setHours(mustRecheck.getMinutes() + 15);
		logger.info('next update check: %s', dumpDate.time(mustRecheck));
		return (new Date) <= mustRecheck;
	}

	private async handleQuit(data: UpdateListFulfilled, logger: (msg: string, ...args: any[]) => void) {
		for (const { name, version, downloaded } of data) {
			logger('update package:', name);

			const thisPackageLoc = this.nodePathService.getPackagesPath(name);

			logger('  rimraf(%s)', thisPackageLoc);
			await rimraf(thisPackageLoc);

			logger('  copy(%s, %s)', downloaded, thisPackageLoc);
			await copy(downloaded, thisPackageLoc);
			this.bundledVersions[name] = version;
			logger('  writeFile(%s) -> %s = %s', this.packageBundleFile, name, version);
			await writeFile(this.packageBundleFile, JSON.stringify(this.bundledVersions, null, 2));
		}
	}

	private _showNotify() {
		const win = new BrowserWindow({
			height: 800,
			width: 800,
			x: 0,
			y: 0,
			maximizable: false,
			closable: false,
			fullscreenable: false,
			title: 'Updating...',
			show: true,
			titleBarStyle: 'hidden',
			vibrancy: 'popover',
		});

		let message = '<body style="display:flex;flex-direction:column;"><h1>Updating, please wait...</h1>';

		if (isWindows) {
			message += '<h2>This will take no more than few minutes.</h2>';
		} else {
			message += '<h2>This will take about few seconds.</h2>';
		}

		message += `<div id="log" style="width:100%;flex:1;overflow-y:scroll;word-break:break-all;"></div><script type="text/javascript">
window.doLog = function (msg){
	console.log(msg);
	const d = document.createElement('DIV');
	d.innerText = msg;
	
	const l = document.getElementById('log');
	l.appendChild(d);
	l.scrollTop = d.scrollHeight;
}
</script>`;
		message += '</body>';
		win.loadURL(`data:text/html;charset=utf8,${encodeURIComponent(message)}`);
		return win;
	}
}

registerMainSingleton(IIDEBuildingBlocksService, IDEBuildingBlocksService);
