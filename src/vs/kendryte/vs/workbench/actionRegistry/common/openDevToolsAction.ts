import { IWindowService } from 'vs/platform/windows/common/windows';
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_BUILD_DEBUG } from 'vs/kendryte/vs/base/common/menu/cmake';

export class OpenDevToolsAction extends Action {

	static readonly ID = 'workbench.action.openDevTools';
	static LABEL = localize('openDevTools', 'Open Developer Tools');

	constructor(id: string, label: string, @IWindowService private windowsService: IWindowService) {
		super(id, label);
	}

	run(): Promise<void> {
		return this.windowsService.openDevTools({
			mode: 'detach',
		});
	}
}

registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, OpenDevToolsAction);
