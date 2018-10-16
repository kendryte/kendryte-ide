import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ACTION_ID_MAIX_CMAKE_SELECT_TARGET } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';

export class MaixCMakeSelectTargetAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_SELECT_TARGET;
	public static readonly LABEL = localize('SelectTarget', 'Select Target');
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeSelectTargetAction.ID, label = MaixCMakeSelectTargetAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@IQuickInputService protected quickInputService: IQuickInputService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(): TPromise<void> {
		const selections = await this.cmakeService.getTargetList();
		const selected = selections.findIndex((item) => {
			return item.current;
		});
		const item = await this.quickInputService.pick(selections, {
			placeHolder: 'select build target:',
			activeItem: selections[selected],
		});
		if (!item) {
			return;
		}
		this.cmakeService.setTarget(item.id);
	}
}
