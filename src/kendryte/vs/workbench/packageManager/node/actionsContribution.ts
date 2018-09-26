import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { SerialPortActionCategory } from 'kendryte/vs/workbench/serialPort/common/type';
import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_UPGRADE_PACKAGES, IPackagesUpdateService, PACKAGE_UPDATER_LOG_CHANNEL } from 'kendryte/vs/platform/common/type';
import { IChannelLogger, IChannelLogService } from 'kendryte/vs/platform/node/channelLogService';
import { IPartService } from 'vs/workbench/services/part/common/partService';

export class OpenPackageUpgradeAction extends Action {
	public static readonly ID = ACTION_ID_UPGRADE_PACKAGES;
	public static readonly LABEL = localize('packageManager.upgrade', 'Packages upgrade');
	protected logger: IChannelLogger;

	constructor(
		id: string,
		label: string,
		@IChannelLogService channelLogService: IChannelLogService,
		@IPartService protected partService: IPartService,
		@IPackagesUpdateService private packagesUpdateService: IPackagesUpdateService,
	) {
		super(id, label, 'terminal-action octicon octicon-repo-sync');
		this.logger = channelLogService.createChannel({
			id: PACKAGE_UPDATER_LOG_CHANNEL, label: 'Kendryte Update', log: true,
		});
	}

	public async run(event?: any): TPromise<void> {
		await this.logger.show();
		if (!this.partService.isPanelMaximized()) {
			this.partService.toggleMaximizedPanel();
		}

		return this.packagesUpdateService.run(true);
	}
}

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(
		new SyncActionDescriptor(
			OpenPackageUpgradeAction,
			OpenPackageUpgradeAction.ID,
			OpenPackageUpgradeAction.LABEL,
		),
		'Package Manager: Packages upgrade',
		SerialPortActionCategory,
	);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: OpenPackageUpgradeAction.ID,
		title: `${SerialPortActionCategory}: ${OpenPackageUpgradeAction.LABEL}`,
	},
});
