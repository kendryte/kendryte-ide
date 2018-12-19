import { Action } from 'vs/base/common/actions';
import { ACTION_ID_REBOOT, ACTION_LABEL_REBOOT } from 'vs/kendryte/vs/base/common/menu/processTool';
import { IWindowsService } from 'vs/platform/windows/common/windows';

export class RebootAction extends Action {
	static readonly ID = ACTION_ID_REBOOT;
	static readonly LABEL = ACTION_LABEL_REBOOT;

	constructor(
		id: string = ACTION_ID_REBOOT, label: string = ACTION_LABEL_REBOOT,
		@IWindowsService private readonly windowsService: IWindowsService,
	) {
		super(id, label);
	}

	async run() {
		return this.windowsService.relaunch({});
	}
}
