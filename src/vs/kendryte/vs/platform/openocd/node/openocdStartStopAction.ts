import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_OPENOCD_RESTART,
	ACTION_ID_OPENOCD_START,
	ACTION_ID_OPENOCD_STOP,
	ACTION_LABEL_OPENOCD_RESTART,
	ACTION_LABEL_OPENOCD_START,
	ACTION_LABEL_OPENOCD_STOP,
} from 'vs/kendryte/vs/base/common/menu/openocd';

export class OpenOCDStartAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_START;
	public static readonly LABEL = ACTION_LABEL_OPENOCD_START;

}

export class OpenOCDStopAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_STOP;
	public static readonly LABEL = ACTION_LABEL_OPENOCD_STOP;

}

export class OpenOCDRestartAction extends Action {
	public static readonly ID = ACTION_ID_OPENOCD_RESTART;
	public static readonly LABEL = ACTION_LABEL_OPENOCD_RESTART;

}
