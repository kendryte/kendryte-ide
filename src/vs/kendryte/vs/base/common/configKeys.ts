import { localize } from 'vs/nls';
import { ACTION_CATEGORY_BUILD_DEBUG } from 'vs/kendryte/vs/base/common/menu/cmake';

export const CONFIG_CATEGORY = {
	KENDRYTE: { id: 'kendryte', category: localize('kendryte', 'Kendryte') },
	MAIN: { id: 'build-deploy', category: ACTION_CATEGORY_BUILD_DEBUG },
	BUILD: { id: 'build', category: localize('build', 'Build'), parent: 'build-deploy' },
	ID_DEBUG: { id: 'debug', category: localize('debug', 'Debug'), parent: 'build-deploy' },
	OPENOCD: { id: 'openocd', category: localize('openocd', 'OpenOCD'), parent: 'build-deploy' },
	DEBUG_JTAG: { id: 'debug.jtag', category: ' › ' + localize('jtag', 'JTag'), parent: 'build-deploy' },
	DEBUG_FTDI: { id: 'debug.ftdi', category: ' › ' + localize('ftdi', 'FTDI'), parent: 'build-deploy' },
	DEBUG_CUSTOM: { id: 'debug.custom', category: ' › ' + localize('custom', 'Custom'), parent: 'build-deploy' },
	DEPLOY: { id: 'deploy', category: localize('deploy', 'Deploy'), parent: 'build-deploy' },
};

//
export const CONFIG_KEY_BUILD_VERBOSE = 'cmake.build.verbose';
export const CONFIG_LABEL_BUILD_VERBOSE = localize('cmake.build.verbose.lbl', 'Verbose build');
export const CONFIG_DESCRIPTION_BUILD_VERBOSE = localize('cmake.build.verbose.desc', 'Verbose log when run build');

export const CONFIG_KEY_CMAKE_DEBUG = 'cmake.debug';
export const CONFIG_LABEL_DEBUG = localize('cmake.debug.lbl', 'Debug CMake output');
export const CONFIG_DESCRIPTION_DEBUG = localize('cmake.debug.desc', 'Super verbose cmake output, for debug only');

export const CONFIG_KEY_MAKE_PROGRAM = 'cmake.build.make-program';
export const CONFIG_LABEL_MAKE_PROGRAM = '"make" program';
export const CONFIG_DESCRIPTION_MAKE_PROGRAM = 'where is "make" program located';

//
export const CONFIG_KEY_OPENOCD_USE = 'debug.openocd.config';
export const CONFIG_DESCRIPTION_OPENOCD_USE = localize('debug.openocd.config', 'select how openocd is configured');

export const CONFIG_KEY_OPENOCD_PORT = 'debug.openocd.port';
export const CONFIG_DESCRIPTION_OPENOCD_PORT = localize('debug.openocd.port', 'openocd listen port, 0 means auto select');

export const CONFIG_KEY_OPENOCD_CORE = 'debug.openocd.core';
export const CONFIG_DESCRIPTION_OPENOCD_CORE = localize('debug.openocd.core', 'which core to debug, -1 means all core');

//
export const CONFIG_KEY_JTAG_ID = 'debug.jtag.id';
export const CONFIG_DESCRIPTION_JTAG_ID = localize('debug.jtag.id.desc', 'Serial number of JTag device, 0 means use first available.');

export const CONFIG_KEY_JTAG_SPEED = 'debug.jtag.speed';
export const CONFIG_DESCRIPTION_JTAG_SPEED = localize('debug.jtag.speed.desc', 'khz');

//
export const CONFIG_KEY_FTDI_SPEED = 'debug.ftdi.speed';
export const CONFIG_DESCRIPTION_FTDI_SPEED = localize('debug.ftdi.speed.desc', 'khz');

export const CONFIG_KEY_FTDI_VID_PID = 'debug.ftdi.vid_pid';
export const CONFIG_DESCRIPTION_FTDI_VID_PID = localize('debug.ftdi.vid_pid.desc', 'FTDI USB device VID PID value (two HEX string, eg: "1a2b 3c4d")');

export const CONFIG_KEY_FTDI_LAYOUT = 'debug.ftdi.layout';
export const CONFIG_DESCRIPTION_FTDI_LAYOUT = localize('debug.ftdi.layout.desc', 'layout init value (two HEX string, eg: "1a2b 3c4d")');

export const CONFIG_KEY_FTDI_TDO_FE = 'debug.ftdi.tdo-fe';
export const CONFIG_DESCRIPTION_FTDI_TDO_FE = localize('debug.ftdi.tdo-fe.desc', 'ftdi_tdo_sample_edge value');

export const CONFIG_KEY_FTDI_EXTRA = 'debug.ftdi.extra';
export const CONFIG_DESCRIPTION_FTDI_EXTRA = localize('debug.ftdi.extra.desc', 'extra config sections');

//
export const CONFIG_KEY_CUSTOM = 'debug.custom';
export const CONFIG_DESCRIPTION_CUSTOM = localize('debug.custom.desc', 'custom openocd config file');

//
export const CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE = 'serialport.monitor.baudrate';
export const CONFIG_KEY_FLASH_SERIAL_BAUDRATE = 'serialport.flash.baudrate';

//
export const CONFIG_KEY_FILTER_EMPTY_DEVICES = 'serialport.common.filter-empty';
export const CONFIG_DESCRIPTION_FILTER_EMPTY_DEVICES = localize('debug.common.filter-empty.desc', 'Filter out device without productID');
