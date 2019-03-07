import { isWindows } from 'vs/base/common/platform';
import { isUpdater } from 'vs/kendryte/vs/base/common/platform';
import { ACTION_CATEGORY_TOOLS, ACTION_ID_OPEN_FPIOA_EDIT, ACTION_LABEL_OPEN_FPIOA_EDIT, } from 'vs/kendryte/vs/base/common/menu/tools';
import {
	ACTION_CATEGORY_OPENOCD,
	ACTION_ID_JTAG_GET_ID,
	ACTION_ID_JTAG_INSTALL_DRIVER,
	ACTION_ID_JTAG_INSTALL_DRIVER_O,
	ACTION_ID_OPENOCD_RESTART,
	ACTION_ID_OPENOCD_START,
	ACTION_ID_OPENOCD_STOP,
	ACTION_LABEL_JTAG_GET_ID,
	ACTION_LABEL_JTAG_INSTALL_DRIVER,
	ACTION_LABEL_JTAG_INSTALL_DRIVER_O,
	ACTION_LABEL_OPENOCD_RESTART,
	ACTION_LABEL_OPENOCD_START,
	ACTION_LABEL_OPENOCD_STOP,
} from 'vs/kendryte/vs/base/common/menu/openocd';
import {
	ACTION_ID_MAIX_CMAKE_BUILD,
	ACTION_ID_MAIX_CMAKE_CLEANUP,
	ACTION_ID_MAIX_CMAKE_CONFIGURE,
	ACTION_ID_MAIX_CMAKE_RUN,
	ACTION_ID_MAIX_SERIAL_UPLOAD,
	ACTION_LABEL_MAIX_CMAKE_BUILD,
	ACTION_LABEL_MAIX_CMAKE_CLEANUP,
	ACTION_LABEL_MAIX_CMAKE_CONFIGURE,
	ACTION_LABEL_MAIX_CMAKE_RUN,
	ACTION_LABEL_MAIX_SERIAL_UPLOAD,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import {
	ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
	ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET,
	ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY,
	ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET,
} from 'vs/kendryte/vs/base/common/menu/packageManager';
import {
	ACTION_ID_QUIT_UPDATE,
	ACTION_ID_REBOOT,
	ACTION_ID_RELOAD,
	ACTION_ID_REPORT_BUG,
	ACTION_LABEL_QUIT_UPDATE,
	ACTION_LABEL_REBOOT,
	ACTION_LABEL_RELOAD,
	ACTION_LABEL_REPORT_BUG,
} from 'vs/kendryte/vs/base/common/menu/processTool';
import { ACTION_ID_OPEN_FORUM, ACTION_LABEL_OPEN_FORUM } from 'vs/kendryte/vs/base/common/menu/webLink';

export class MyMenuSeparator {
	public readonly separator = true;

	constructor(
		public readonly id: string,
	) { }
}

export class MyMenu {

	constructor(
		public readonly commandId: string,
		public readonly title: string,
	) { }
}

export class MySubMenu {
	constructor(
		public readonly title: string,
		public readonly submenu: ReadonlyArray<MyMenuElement>,
	) { }
}

export type MyMenuElement = (MyMenu | MyMenuSeparator | MySubMenu);
export type MyMenuRegistry = ReadonlyArray<MyMenuElement>;

export const ApplicationMenuStructure: MyMenuRegistry = [
	new MyMenuSeparator('kendryte'),

	new MyMenu(ACTION_ID_OPEN_FORUM, ACTION_LABEL_OPEN_FORUM),
	new MyMenu(ACTION_ID_OPEN_FPIOA_EDIT, ACTION_LABEL_OPEN_FPIOA_EDIT),

	new MyMenuSeparator('debug'),
	new MySubMenu(ACTION_CATEGORY_OPENOCD, [
		new MyMenuSeparator('openocd'),
		new MyMenu(ACTION_ID_OPENOCD_START, ACTION_LABEL_OPENOCD_START),
		new MyMenu(ACTION_ID_OPENOCD_STOP, ACTION_LABEL_OPENOCD_STOP),
		new MyMenu(ACTION_ID_OPENOCD_RESTART, ACTION_LABEL_OPENOCD_RESTART),
		new MyMenuSeparator('openocd_interface'),
		new MyMenuSeparator('jtag'),
		new MyMenu(ACTION_ID_JTAG_GET_ID, ACTION_LABEL_JTAG_GET_ID),
		new MyMenu(ACTION_ID_JTAG_INSTALL_DRIVER, ACTION_LABEL_JTAG_INSTALL_DRIVER),
		isWindows ? new MyMenu(ACTION_ID_JTAG_INSTALL_DRIVER_O, ACTION_LABEL_JTAG_INSTALL_DRIVER_O) : null,
	]),

	new MyMenu(ACTION_ID_MAIX_CMAKE_CLEANUP, ACTION_LABEL_MAIX_CMAKE_CLEANUP),
	new MyMenu(ACTION_ID_MAIX_CMAKE_CONFIGURE, ACTION_LABEL_MAIX_CMAKE_CONFIGURE),
	new MyMenu(ACTION_ID_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_BUILD),
	new MyMenu(ACTION_ID_MAIX_CMAKE_RUN, ACTION_LABEL_MAIX_CMAKE_RUN),
	new MyMenu(ACTION_ID_MAIX_SERIAL_UPLOAD, ACTION_LABEL_MAIX_SERIAL_UPLOAD),

	new MyMenuSeparator('pacakge-manager'),
	new MyMenu(ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET, ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET),
	new MyMenu(ACTION_ID_PACKAGE_MANAGER_INSTALL_DEPENDENCY, ACTION_LABEL_PACKAGE_MANAGER_INSTALL_DEPENDENCY),

	new MyMenuSeparator('tools'),
	new MySubMenu(ACTION_CATEGORY_TOOLS, [
		// new MyMenu(ACTION_ID_CREATE_SHORTCUTS, ACTION_LABEL_CREATE_SHORTCUTS),
		new MyMenuSeparator('reboot'),
		new MyMenu(ACTION_ID_RELOAD, ACTION_LABEL_RELOAD),
		new MyMenu(ACTION_ID_REBOOT, ACTION_LABEL_REBOOT),
		isUpdater ? new MyMenu(ACTION_ID_QUIT_UPDATE, ACTION_LABEL_QUIT_UPDATE) : null,
	]),

	new MyMenu(ACTION_ID_REPORT_BUG, ACTION_LABEL_REPORT_BUG),
];
