import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { ACTION_ID_MAIX_CMAKE_CLEANUP, ACTION_LABEL_MAIX_CMAKE_CLEANUP } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';

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
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(): TPromise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL, true);

		await this.cmakeService.cleanupMake();
	}
}
