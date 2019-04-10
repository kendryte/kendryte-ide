import { Action } from 'vs/base/common/actions';
import { IOutputChannel, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { ACTION_ID_MAIX_CMAKE_CONFIGURE, ACTION_LABEL_MAIX_CMAKE_CONFIGURE } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';

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
		this.outputChannel = assertNotNull(outputService.getChannel(CMAKE_CHANNEL));
	}

	async run(): Promise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL);

		await this.cmakeService.cleanupMake();
		await this.cmakeService.configure();
	}
}
