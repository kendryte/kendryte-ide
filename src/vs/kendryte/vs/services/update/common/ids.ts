import { localize } from 'vs/nls';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';

export const UpdateActionCategory = localize('update', 'Update');

export const ACTION_ID_UPGRADE_BUILDING_BLOCKS = 'workbench.action.kendryte.packageUpgrade';
export const ACTION_ID_IDE_SELF_UPGRADE = 'workbench.action.kendryte.ideUpgrade';

export const PACKAGE_UPDATER_LOG_CHANNEL = 'maix-update-output-channel';

export function getUpdateLogger(channelLogService: IChannelLogService) {
	return channelLogService.createChannel('Kendryte Update', PACKAGE_UPDATER_LOG_CHANNEL, true);
}
