import { Action } from 'vs/base/common/actions';
import { ACTION_ID_REBOOT, ACTION_LABEL_REBOOT } from 'vs/kendryte/vs/base/common/menu/processTool';
import { IElectronService } from 'vs/platform/electron/node/electron';

export class RebootAction extends Action {
	static readonly ID = ACTION_ID_REBOOT;
	static readonly LABEL = ACTION_LABEL_REBOOT;

	constructor(
		id: string = ACTION_ID_REBOOT, label: string = ACTION_LABEL_REBOOT,
		@IElectronService private readonly electronService: IElectronService,
	) {
		super(id, label);
	}

	async run() {
		return this.electronService.relaunch({});
	}
}
