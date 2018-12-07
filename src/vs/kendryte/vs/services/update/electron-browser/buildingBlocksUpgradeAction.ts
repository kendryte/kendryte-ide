import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IIDEBuildingBlocksService, IUpdate, UpdateFulfilled } from 'vs/kendryte/vs/services/update/common/type';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ACTION_ID_IDE_SELF_UPGRADE, getUpdateLogger, UpdateActionCategory } from 'vs/kendryte/vs/services/update/common/ids';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { finishAllPromise } from 'vs/kendryte/vs/base/common/finishAllPromise';
import { IDownloadWithProgressService } from 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { ACTION_ID_UPGRADE_BUILDING_BLOCKS, ACTION_LABEL_UPGRADE_BUILDING_BLOCKS } from 'vs/kendryte/vs/base/common/menu/selfUpdate';

export class BuildingBlocksUpgradeAction extends Action {
	public static readonly ID = ACTION_ID_UPGRADE_BUILDING_BLOCKS;
	public static readonly LABEL = ACTION_LABEL_UPGRADE_BUILDING_BLOCKS;
	protected logger: IChannelLogger;

	protected dis: IDisposable[] = [];

	constructor(
		id: string = BuildingBlocksUpgradeAction.ID,
		label: string = BuildingBlocksUpgradeAction.LABEL,
		@ICommandService private commandService: ICommandService,
		@INotificationService private notificationService: INotificationService,
		@IChannelLogService private channelLogService: IChannelLogService,
		@IPartService private partService: IPartService,
		@IIDEBuildingBlocksService private ideBuildingBlocksService: IIDEBuildingBlocksService,
		@IDownloadWithProgressService private downloadWithProgressService: IDownloadWithProgressService,
		@IFileCompressService private fileCompressService: IFileCompressService,
		@INodePathService nodePathService: INodePathService,
	) {
		super(id, label, 'terminal-action octicon octicon-repo-sync');
		this.logger = getUpdateLogger(channelLogService);
	}

	dispose() {
		dispose(this.dis);
		this.dis.length = 0;
		return super.dispose();
	}

	public run(event?: any, data?: any): TPromise<boolean> {
		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'prepare update...',
		});
		this.dis.push(handle);

		this.logger.info('Start update ==========================');
		return this._run(handle).then((updated) => {
			handle.dispose();

			if (!updated) {
				if (data && (data.from === 'menu' || data.from === 'touchbar')) {
					this.notificationService.info('No update available.');
				}
			}

			return updated;
		}, (e) => {
			this.logger.error('==========================');
			this.logger.error('Cannot update.');
			this.logger.error(e);
			this.showFailedMessage(`Cannot update required packages:\n${e.message}\nDo you want to retry?`);
			throw e;
		});
	}

	public async _run(handle: INotificationHandle) {
		handle.updateMessage(`checking update...`);
		this.logger.info('check building blocks update...');
		this.logger.info('  fetchUpdateInfo()');

		const updateInfos = await this.ideBuildingBlocksService.fetchUpdateInfo(this.logger, true);
		this.logger.info(' -> %s item(s) to update.', updateInfos.length);

		if (updateInfos.length === 0) {
			this.logger.info('No update.');
			return false;
		}

		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		this.logger.info('Downloading updates');
		handle.updateMessage(`packages update: download and extract (${updateInfos.length} items)`);
		const downloadedItems = await finishAllPromise(updateInfos.map((pkg) => this.handleEveryPackage(pkg)));
		handle.updateMessage(`completing...)`);

		if (downloadedItems.rejected.length) {
			throw this.buildFailedMessage(
				downloadedItems.rejected,
				updateInfos.map(e => e.name),
				downloadedItems.rejectedResult,
			);
		}

		handle.updateMessage('apply updates...');
		await this.ideBuildingBlocksService.realRunUpdate(downloadedItems.fulfilledResult);

		return true;
	}

	private async handleEveryPackage(pkg: IUpdate): Promise<UpdateFulfilled> {
		this.logger.info('download: ' + pkg.name);
		const file = await this.downloadWithProgressService.downloadTemp(pkg.downloadUrl, this.logger);
		this.logger.info('download complete: ' + pkg.name);

		const subHandle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: `extracting ${pkg.name} ...`,
		});

		return this.fileCompressService.extractTemp(file, this.logger).then((extracted) => {
			this.logger.info('extract complete: ' + pkg.name);
			subHandle.dispose();

			return Object.assign(pkg, {
				downloaded: extracted,
			});
		}, (e) => {
			this.logger.error('extract error: ' + pkg.name + ': ' + e.message);
			subHandle.dispose();
			throw e;
		});
	}

	private buildFailedMessage(indexArr: number[], names: string[], errors: Error[]) {
		let message: string = '';
		for (const index of indexArr) {
			message += ` * ${names[index]}: ${errors[index].message}\n`;
		}
		return new Error(message);
	}

	private showFailedMessage(message: string) {
		this.notificationService.notify({
			severity: Severity.Error,
			message,
			actions: {
				primary: [
					new Action('retry', localize('retry', 'Retry'), 'primary', true, async () => {
						setTimeout(() => {
							this.commandService.executeCommand(ACTION_ID_UPGRADE_BUILDING_BLOCKS).catch();
						}, 100);
					}),
					new Action('cancel', localize('cancel', 'Cancel'), '', true),
				],
			},
		});
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(
		new SyncActionDescriptor(
			BuildingBlocksUpgradeAction,
			BuildingBlocksUpgradeAction.ID,
			BuildingBlocksUpgradeAction.LABEL,
		),
		'Update required packages',
		UpdateActionCategory,
	);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: BuildingBlocksUpgradeAction.ID,
		title: `${UpdateActionCategory}: ${BuildingBlocksUpgradeAction.LABEL}`,
	},
});

class IDESelfUpgradeAction extends Action {
	public static readonly ID = ACTION_ID_IDE_SELF_UPGRADE;
	public static readonly LABEL = localize('packageManager.upgrade.ide', 'Update Kendryte IDE');
	protected logger: IChannelLogger;

	constructor(
		id: string,
		label: string,
		@IChannelLogService private channelLogService: IChannelLogService,
		@IPartService private partService: IPartService,
		@IUpdateService private updateService: IUpdateService,
	) {
		super(id, label, 'terminal-action octicon octicon-repo-sync');
		this.logger = getUpdateLogger(channelLogService);
	}

	public async run(event?: any): TPromise<boolean> {
		if (await this.updateService.isLatestVersion() !== false) {
			this.logger.info('is already up to date.');
			return false;
		}
		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		await this.updateService.checkForUpdates({ notify: true });

		return true;
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(
		new SyncActionDescriptor(
			IDESelfUpgradeAction,
			IDESelfUpgradeAction.ID,
			IDESelfUpgradeAction.LABEL,
		),
		'Update Kendryte IDE',
		UpdateActionCategory,
	);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: IDESelfUpgradeAction.ID,
		title: `${UpdateActionCategory}: ${IDESelfUpgradeAction.LABEL}`,
	},
});
