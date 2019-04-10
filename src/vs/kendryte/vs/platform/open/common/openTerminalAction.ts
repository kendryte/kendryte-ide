import { Action } from 'vs/base/common/actions';
import { ACTION_ID_OPEN_EXTERNAL_TERMINAL, ACTION_LABEL_OPEN_EXTERNAL_TERMINAL } from 'vs/kendryte/vs/platform/open/common/actionIds';

export class OpenTerminalAction extends Action {
	static readonly ID = ACTION_ID_OPEN_EXTERNAL_TERMINAL;
	static readonly LABEL = ACTION_LABEL_OPEN_EXTERNAL_TERMINAL;

	constructor() {
		super(OpenTerminalAction.ID, OpenTerminalAction.LABEL);
	}

	async run() {
		throw new Error('to be implement');
	}
}
