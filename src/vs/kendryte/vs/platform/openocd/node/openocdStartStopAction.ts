import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { ACTION_ID_OPENOCD_RESTART, ACTION_ID_OPENOCD_START, ACTION_ID_OPENOCD_STOP } from 'vs/kendryte/vs/platform/openocd/common/type';

export class OpenOCDStartAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_START;
	public static readonly LABEL = localize('openocd.action.start', 'Start openocd server');

}

export class OpenOCDStopAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_STOP;
	public static readonly LABEL = localize('openocd.action.stop', 'Stop openocd server');

}

export class OpenOCDRestartAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_RESTART;
	public static readonly LABEL = localize('openocd.action.restart', 'Restart openocd server');

}
