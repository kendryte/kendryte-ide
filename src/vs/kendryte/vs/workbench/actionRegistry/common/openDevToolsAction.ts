import { IElectronService } from 'vs/platform/electron/node/electron';
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_BUILD_DEBUG } from 'vs/kendryte/vs/base/common/menu/cmake';

export class OpenDevToolsAction extends Action {

	static readonly ID = 'workbench.action.openDevTools';
	static LABEL = localize('openDevTools', 'Open Developer Tools');

	constructor(id: string, label: string, @IElectronService private electronService: IElectronService) {
		super(id, label);
	}

	run(): Promise<void> {
		return this.electronService.openDevTools({
			mode: 'detach',
		});
	}
}

registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, OpenDevToolsAction);
