import { Action } from 'vs/base/common/actions';
import { IOutputChannel, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { ACTION_ID_MAIX_CMAKE_CLEANUP, ACTION_LABEL_MAIX_CMAKE_CLEANUP } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';

export class MaixCMakeCleanupAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_CLEANUP;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_CLEANUP;
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeCleanupAction.ID, label = MaixCMakeCleanupAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
	) {
		super(id, label);
		this.outputChannel = assertNotNull(outputService.getChannel(CMAKE_CHANNEL));
	}

	async run(): Promise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL, true);

		await this.cmakeService.cleanupMake();
	}
}
