import { localize } from 'vs/nls';

export const enum MyStatusBarItemNames {
	SERIAL_LABEL = 'serial_label',
	SERIAL_MONITOR = 'serial_monitor',
	REBOOT_BUTTON = 'reboot_button',
	ISP_BUTTON = 'isp_button',
	SELECT_SERIAL_PORT = 'select_serial_port',
	CMAKE_LABEL = 'cmake_label',
	CMAKE_CHECK_SUCCESS = 'cmake_check_success',
	CMAKE_CHECK_ERROR = 'cmake_check_error',
	WORKSPACE_SELECTION = 'workspace_selection',
	CLEAN_BUTTON = 'clean_button',
	BUILD_BUTTON = 'build_button',
	DEBUG_BUTTON = 'debug_button',
	LAUNCH_BUTTON = 'launch_button',
	FLASH_BUTTON = 'flash_button',
	ALERT_MESSAGE = 'alert_message',
}

export function getNameOfButton(id: MyStatusBarItemNames) {
	switch (id) {
		case MyStatusBarItemNames.SERIAL_LABEL:
			return localize('serial_label', 'serial buttons label');
		case MyStatusBarItemNames.SERIAL_MONITOR:
			return localize('serial_monitor', 'open serial monitor button');
		case MyStatusBarItemNames.REBOOT_BUTTON:
			return localize('reboot_button', 'reboot board button');
		case MyStatusBarItemNames.ISP_BUTTON:
			return localize('isp_button', 'reboot board to isp mode button');
		case MyStatusBarItemNames.SELECT_SERIAL_PORT:
			return localize('select_serial_port', 'serial port selection');
		case MyStatusBarItemNames.CMAKE_LABEL:
			return localize('cmake_label', 'cmake buttons label');
		case MyStatusBarItemNames.CMAKE_CHECK_SUCCESS:
			return localize('cmake_check_success', 'cmake check success');
		case MyStatusBarItemNames.CMAKE_CHECK_ERROR:
			return localize('cmake_check_error', 'cmake check fail');
		case MyStatusBarItemNames.WORKSPACE_SELECTION:
			return localize('workspace_selection', 'select workspace');
		case MyStatusBarItemNames.CLEAN_BUTTON:
			return localize('clean_button', 'clean build result');
		case MyStatusBarItemNames.BUILD_BUTTON:
			return localize('build_button', 'start build');
		case MyStatusBarItemNames.DEBUG_BUTTON:
			return localize('debug_button', 'start debug');
		case MyStatusBarItemNames.LAUNCH_BUTTON:
			return localize('launch_button', 'run program without debug');
		case MyStatusBarItemNames.FLASH_BUTTON:
			return localize('flash_button', 'flash program to the board');
		case MyStatusBarItemNames.ALERT_MESSAGE:
			return localize('alert_message', 'alert message');
	}
}
