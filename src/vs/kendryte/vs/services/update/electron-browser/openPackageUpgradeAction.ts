import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IIDEBuildingBlocksService } from 'vs/kendryte/vs/platform/common/type';
import { IPartService } from 'vs/workbench/services/part/common/partService';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ACTION_ID_IDE_SELF_UPGRADE, ACTION_ID_UPGRADE_BUILDING_BLOCKS, getUpdateLogger, UpdateActionCategory } from 'vs/kendryte/vs/services/update/common/ids';
import { IUpdateService } from 'vs/platform/update/common/update';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { unClosableNotify } from 'vs/kendryte/vs/platform/progress/common/unClosableNotify';
import { finishAllPromise } from 'vs/kendryte/vs/base/common/finishAllPromise';
import { IDownloadWithProgressService } from 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';

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
		@IIDEBuildingBlocksService private packagesUpdateService: IIDEBuildingBlocksService,
		@IDownloadWithProgressService private downloadWithProgressService: IDownloadWithProgressService,
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
		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		const handle = unClosableNotify(this.notificationService, {
			severity: Severity.Info,
			message: 'prepare update...',
		});
		this.dis.push(handle);

		const dis = this.packagesUpdateService.onProgress((message: string) => {
			handle.updateMessage(message);
		});

		const updateInfos = await this.packagesUpdateService.fetchUpdateInfo(this.logger, true);

		dis.dispose();

		handle.updateMessage(`downloading...`);
		const downloadedItems = await finishAllPromise(updateInfos.map(([name, downloadId]) => {
			return this.downloadWithProgressService.continue(name, downloadId);
		}));

		if (downloadedItems.rejected.length) {
			this.showFailedMessage(
				handle,
				downloadedItems.rejected,
				updateInfos.map(e => e[0]),
				downloadedItems.rejectedResult,
			);
			return;
		}
	}

	private showFailedMessage(handle: INotificationHandle, indexArr: number[], names: string[], errors: Error[]) {
		handle.updateSeverity(Severity.Error);
		let message: string = 'Cannot download Required package:\n';
		for (const index of indexArr) {
			message += ` * ${names[index]}: ${errors[index].message}\n`;
		}
		message += `Do you want to retry?`;
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
		await this.channelLogService.show(this.logger.id);
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		await this.updateService.checkForUpdates({});
		if (await this.updateService.isLatestVersion()) {
			return;
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
