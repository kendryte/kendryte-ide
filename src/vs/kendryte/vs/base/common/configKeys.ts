import { localize } from 'vs/nls';

export const CONFIG_CATEGORY = {
	MAIN: { id: 'build-deploy', category: localize('and', '{0} and {1}', localize('build', 'Build'), localize('debug', 'Debug')) },
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

//

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

export const CONFIG_KEY_FTDI_VIDPID = 'debug.ftdi.vidpid';
export const CONFIG_DESCRIPTION_FTDI_VIDPID = localize('debug.ftdi.vidpid.desc', 'USB vid and pid value (HEX string, eg: 1a2b)');

export const CONFIG_KEY_FTDI_LAYOUT = 'debug.ftdi.layout';
export const CONFIG_DESCRIPTION_FTDI_LAYOUT = localize('debug.ftdi.layout.desc', 'layout init value (HEX string, eg: 1a2b)');

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
export const CONFIG_KEY_RELOAD_SERIAL_DEVICES = 'serialport.reloadDevice';
