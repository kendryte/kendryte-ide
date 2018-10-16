import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IIDEBuildingBlocksService } from 'vs/kendryte/vs/services/update/common/type';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ACTION_ID_IDE_SELF_UPGRADE, ACTION_ID_UPGRADE_BUILDING_BLOCKS, getUpdateLogger, UpdateActionCategory } from 'vs/kendryte/vs/services/update/common/ids';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { unClosableNotify } from 'vs/kendryte/vs/workbench/progress/common/unClosableNotify';
import { finishAllPromise } from 'vs/kendryte/vs/base/common/finishAllPromise';
import { IDownloadWithProgressService } from 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';

class BuildingBlocksUpgradeAction extends Action {
	public static readonly ID = ACTION_ID_UPGRADE_BUILDING_BLOCKS;
	public static readonly LABEL = localize('packageManager.upgrade.building', 'Update required packages');
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

	public async run(event?: any): TPromise<void> {
		this.logger.info('check building blocks update...');

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'prepare update...',
		});
		this.dis.push(handle);

		this.logger.info('  fetchUpdateInfo()');
		const updateInfos = await this.ideBuildingBlocksService.fetchUpdateInfo(this.logger, true).then(undefined, (e) => {
			this.logger.error('==========================');
			this.logger.error('Cannot update.');
			this.logger.error(e);
			this.showFailedMessage(handle, 'Cannot check update info: ' + e.message);
			throw e;
		});
		this.logger.info(' -> %s item(s) to update.', updateInfos.length);

		if (updateInfos.length === 0) {
			handle.dispose();
			this.logger.info('No update.');
			return;
		}

		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		this.logger.info('Downloading updates');
		handle.updateMessage(`packages update: download and extract (${updateInfos.length} items)`);
		const downloadedItems = await finishAllPromise(updateInfos.map(async (pkg) => {
			this.logger.info('download continue: ' + pkg.name);
			const file = await this.downloadWithProgressService.downloadTemp(pkg.downloadUrl, this.logger);

			const subHandle = unClosableNotify(this.notificationService, {
				severity: Severity.Info,
				message: `extracting ${pkg.name} ...`,
			});

			const extracted = await this.fileCompressService.extractTemp(file, this.logger).then((p) => {
				subHandle.dispose();
				return p;
			}, (e) => {
				subHandle.revoke();
				subHandle.updateSeverity(Severity.Error);
				subHandle.updateMessage(e);
				throw e;
			});

			return Object.assign(pkg, {
				downloaded: extracted,
			});
		}));

		if (downloadedItems.rejected.length) {
			handle.revoke();
			this.buildFailedMessage(
				handle,
				downloadedItems.rejected,
				updateInfos.map(e => e[0]),
				downloadedItems.rejectedResult,
			);
			return;
		}

		handle.updateMessage('apply updates...');
		await this.ideBuildingBlocksService.realRunUpdate(downloadedItems.fulfilledResult);
	}

	private buildFailedMessage(handle: INotificationHandle, indexArr: number[], names: string[], errors: Error[]) {
		let message: string = 'Cannot download Required package:\n';
		for (const index of indexArr) {
			message += ` * ${names[index]}: ${errors[index].message}\n`;
		}
		message += `Do you want to retry?`;
		this.showFailedMessage(handle, message);
	}

	private showFailedMessage(handle: INotificationHandle, message: string) {
		handle.updateSeverity(Severity.Error);
		handle.updateMessage(message);
		handle.updateActions({
			primary: [
				new Action('retry', localize('retry', 'Retry'), 'primary', true, async () => {
					setInterval(() => {
						this.commandService.executeCommand(ACTION_ID_UPGRADE_BUILDING_BLOCKS);
					}, 100);
				}),
				new Action('cancel', localize('cancel', 'Cancel'), '', true),
			],
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

	public async run(event?: any): TPromise<void> {
		await this.updateService.checkForUpdates({});
		if (await this.updateService.isLatestVersion()) {
			return;
		}

		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		await this.updateService.downloadUpdate();
		await this.updateService.applyUpdate();
		await this.updateService.quitAndInstall();
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
