import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { INotificationService, IPromptChoice, Severity } from 'vs/platform/notification/common/notification';
import { ACTION_ID_CREATE_SHORTCUTS, ACTION_LABEL_CREATE_SHORTCUTS } from 'vs/kendryte/vs/base/common/menu/tools';
import { isLinux, isWindows } from 'vs/base/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Disposable } from 'vs/base/common/lifecycle';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { promiseWithNotificationService } from 'vs/kendryte/vs/platform/notify/common/promiseNotification';

export class CreateShortcutsAction extends Action {
	public static readonly ID = ACTION_ID_CREATE_SHORTCUTS;
	public static readonly LABEL = ACTION_LABEL_CREATE_SHORTCUTS;

	constructor(
		id = CreateShortcutsAction.ID, label = CreateShortcutsAction.LABEL,
		@INodePathService private nodePathService: INodePathService,
		@INotificationService private notificationService: INotificationService,
	) {
		super(id, label);
	}

	run(): Promise<void> {
		const p = this.nodePathService.createAppLink();
		promiseWithNotificationService(ACTION_LABEL_CREATE_SHORTCUTS, p, this.notificationService);
		return p;
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

class FirstBootContribution extends Disposable implements IWorkbenchContribution {
	private readonly storageKey = 'kendryte.firstrun';

	constructor(
		@IStorageService storageService: IStorageService,
		@INotificationService private readonly notificationService: INotificationService,
		@INodePathService private readonly nodePathService: INodePathService,
	) {
		super();

		const isFirstRun = storageService.get(this.storageKey, StorageScope.GLOBAL);
		if (isFirstRun === undefined) {
			this.handle().finally(() => {
				storageService.store(this.storageKey, 'no', StorageScope.GLOBAL);
			});
		}
	}

	private message() {
		if (isWindows) {
			return localize('confirmCreateLink', 'Create a start menu shortcut for Kendryte IDE?');
		} else if (isLinux) {
			return localize('confirmCreateLink', 'Create a system menu item for Kendryte IDE?');
		} else {
			return localize('confirmCreateLink', 'Create a launchpad icon for Kendryte IDE?');
		}
	}

	private async handle() {
		const selections: IPromptChoice[] = [
			{
				label: localize('create', 'Create'),
				run: () => {
					return this.nodePathService.createAppLink();
				},
			},
		];

		const handle = this.notificationService.prompt(Severity.Info, this.message(), selections);

		return new Promise<void>((resolve, reject) => {
			handle.onDidClose(resolve);
		});
	}
}

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(FirstBootContribution, LifecyclePhase.Ready);
