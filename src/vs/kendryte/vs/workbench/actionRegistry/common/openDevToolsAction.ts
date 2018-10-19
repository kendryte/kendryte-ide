import { IWindowService } from 'vs/platform/windows/common/windows';
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';

export class OpenDevToolsAction extends Action {

	static readonly ID = 'workbench.action.openDevTools';
	static LABEL = localize('openDevTools', 'Open Developer Tools');

	constructor(id: string, label: string, @IWindowService private windowsService: IWindowService) {
		super(id, label);
	}

	run(): Thenable<void> {
		return this.windowsService.openDevTools({
			mode: 'detach',
		});
	}
}

registerExternalAction(localize('debug', 'Debug'), OpenDevToolsAction);
