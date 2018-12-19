import { Action } from 'vs/base/common/actions';
import { ACTION_ID_QUIT_UPDATE, ACTION_LABEL_QUIT_UPDATE } from 'vs/kendryte/vs/base/common/menu/processTool';
import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';

export class QuitUpdateAction extends Action {
	static readonly ID = ACTION_ID_QUIT_UPDATE;
	static readonly LABEL = ACTION_LABEL_QUIT_UPDATE;

	constructor(
		id: string = ACTION_ID_QUIT_UPDATE, label: string = ACTION_LABEL_QUIT_UPDATE,
		@IRelaunchService private readonly relaunchService: IRelaunchService,
	) {
		super(id, label);
	}

	async run() {
		return this.relaunchService.launchUpdater();
	}
}

