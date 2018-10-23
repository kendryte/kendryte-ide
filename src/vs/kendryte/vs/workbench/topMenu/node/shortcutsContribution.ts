import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_CREATE_SHORTCUTS } from 'vs/kendryte/vs/workbench/topMenu/common/actionIds';
import { isMacintosh, isWindows } from 'vs/base/common/platform';

export class CreateShortcutsAction extends Action {
	public static readonly ID = ACTION_ID_CREATE_SHORTCUTS;
	public static readonly LABEL = localize('CreateShortcuts', 'Create Shortcuts');

	constructor(
		id = CreateShortcutsAction.ID, label = CreateShortcutsAction.LABEL,
		@INodePathService private nodePathService: INodePathService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	async run(): TPromise<void> {
		console.log('create app link');
		await this.nodePathService.createAppLink();
		if (isWindows) {
			this.notificationService.info('Created shortcut in Start Menu');
		} else if (isMacintosh) {
			this.notificationService.info('Created shortcut in Launchpad');
		} else {
			this.notificationService.info('Created shortcut in system menu');
		}
	}
}

const category = localize('kendryte', 'Kendryte');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(CreateShortcutsAction, CreateShortcutsAction.ID, CreateShortcutsAction.LABEL), 'Kendryte: Create shortcuts', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: CreateShortcutsAction.ID,
		title: `${category}: ${CreateShortcutsAction.LABEL}`,
	},
});
