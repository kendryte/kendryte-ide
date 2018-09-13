// clean
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { ACTION_ID_CREATE_SHORTCUTS, INodePathService } from 'vs/workbench/parts/maix/_library/common/type';
import { TPromise } from 'vs/base/common/winjs.base';

class CreateShortcutsAction extends Action {
	public static readonly ID = ACTION_ID_CREATE_SHORTCUTS;
	public static readonly LABEL = localize('CreateShortcuts', 'Create Shortcuts');

	constructor(
		id = CreateShortcutsAction.ID, label = CreateShortcutsAction.LABEL,
		@INodePathService private  nodePathService: INodePathService,
	) {
		super(id, label);
	}

	run(): TPromise<void> {
		return this.nodePathService.createAppLink();
	}
}

const category = localize('kendryte', 'Kendryte');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
        .registerWorkbenchAction(new SyncActionDescriptor(CreateShortcutsAction, CreateShortcutsAction.ID, CreateShortcutsAction.LABEL), 'Kendryte: Cleanup project', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: CreateShortcutsAction.ID,
		title: `${category}: ${CreateShortcutsAction.LABEL}`,
	},
});
