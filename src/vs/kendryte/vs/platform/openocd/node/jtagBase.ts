import { Action } from 'vs/base/common/actions';
import { ACTION_ID_JTAG_GET_ID, ACTION_ID_JTAG_INSTALL_DRIVER, ACTION_LABEL_JTAG_GET_ID, ACTION_LABEL_JTAG_INSTALL_DRIVER } from 'vs/kendryte/vs/base/common/menu/openocd';

import { TPromise } from 'vs/base/common/winjs.base';

export class DetectJTagIdAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_GET_ID;
	public static readonly LABEL = ACTION_LABEL_JTAG_GET_ID;

	async run(event?: any): TPromise<void> {

	}
}

export class InstallJTagDriverAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_INSTALL_DRIVER;
	public static readonly LABEL = ACTION_LABEL_JTAG_INSTALL_DRIVER;

}
