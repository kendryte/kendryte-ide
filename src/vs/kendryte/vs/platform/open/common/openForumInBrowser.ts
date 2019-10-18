import { IElectronService } from 'vs/platform/electron/node/electron';
import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_FORUM, ACTION_LABEL_OPEN_FORUM } from 'vs/kendryte/vs/base/common/menu/webLink';

export class OpenForumInBrowserAction extends Action {
	static readonly ID = ACTION_ID_OPEN_FORUM;
	static readonly LABEL = ACTION_LABEL_OPEN_FORUM;

	constructor(
		id = OpenForumInBrowserAction.ID, label = OpenForumInBrowserAction.LABEL,
		@IElectronService private readonly electronService: IElectronService,
	) {
		super(id, label, 'link');
	}

	async run() {
		const url = 'https://forum.kendryte.com/category/5/ide';
		await this.electronService.openExternal(url);
	}
}
