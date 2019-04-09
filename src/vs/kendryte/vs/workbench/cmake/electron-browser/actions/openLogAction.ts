import { Action } from 'vs/base/common/actions';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ACTION_ID_SHOW_CMAKE_LOG, ACTION_LABEL_SHOW_CMAKE_LOG } from 'vs/kendryte/vs/base/common/menu/cmake';

/**
 * Reconfigure cmake and open it's log, use when something already error before
 **/
export class MaixCMakeOpenLogAction extends Action {
	public static readonly ID = ACTION_ID_SHOW_CMAKE_LOG;
	public static readonly LABEL = ACTION_LABEL_SHOW_CMAKE_LOG;

	constructor(
		id = MaixCMakeOpenLogAction.ID, label = MaixCMakeOpenLogAction.LABEL,
		@IChannelLogService private readonly channelLogService: IChannelLogService,
	) {
		super(id, label);
	}

	run(): Promise<void> {
		const logger = this.channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
		logger.clear();
		return this.channelLogService.show(logger.id);
	}
}
