import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { ACTION_ID_MAIX_CMAKE_CONFIGURE, ACTION_LABEL_MAIX_CMAKE_CONFIGURE } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';

export class MaixCMakeConfigureAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_CONFIGURE;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_CONFIGURE;
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeConfigureAction.ID, label = MaixCMakeConfigureAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@IQuickInputService protected quickInputService: IQuickInputService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(): TPromise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL);

		await this.cmakeService.cleanupMake();
		await this.cmakeService.configure();
	}
}
