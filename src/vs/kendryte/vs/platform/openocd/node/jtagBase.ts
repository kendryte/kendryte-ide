import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { ACTION_ID_JTAG_GET_ID, ACTION_ID_JTAG_INSTALL_DRIVER } from 'vs/kendryte/vs/platform/openocd/common/type';
import { TPromise } from 'vs/base/common/winjs.base';

export class DetectJTagIdAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_GET_ID;
	public static readonly LABEL = localize('jtag.action.detect', 'Detect connected JTag ids');

	async run(event?: any): TPromise<void> {

	}
}

export class InstallJTagDriverAction extends Action {
	public static readonly ID = ACTION_ID_JTAG_INSTALL_DRIVER;
	public static readonly LABEL = localize('jtag.action.install', 'Install driver');

}
