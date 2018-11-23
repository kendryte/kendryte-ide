import { Action } from 'vs/base/common/actions';
import { ACTION_ID_JTAG_INSTALL_DRIVER, ACTION_LABEL_JTAG_INSTALL_DRIVER } from 'vs/kendryte/vs/base/common/menu/openocd';

export class InstallJTagDriverAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_INSTALL_DRIVER;
	public static readonly LABEL = ACTION_LABEL_JTAG_INSTALL_DRIVER;

	constructor(
		id: string, label: string,
	) {
		super(id, label);
	}
}
