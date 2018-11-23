import { localize } from 'vs/nls';

export const ACTION_CATEGORY_OPENOCD = localize('openocd', 'OpenOCD');
export const ACTION_CATEGORY_JTAG = localize('jtag', 'JTag');

export const ACTION_ID_OPENOCD_START = 'workbench.action.openocd.start';
export const ACTION_LABEL_OPENOCD_START = localize('openocd.action.start', 'Start openocd server');

export const ACTION_ID_OPENOCD_STOP = 'workbench.action.openocd.stop';
export const ACTION_LABEL_OPENOCD_STOP = localize('openocd.action.stop', 'Stop openocd server');

export const ACTION_ID_OPENOCD_RESTART = 'workbench.action.openocd.restart';
export const ACTION_LABEL_OPENOCD_RESTART = localize('openocd.action.restart', 'Restart openocd server');

export const ACTION_ID_JTAG_GET_ID = 'workbench.action.jtag.get';
export const ACTION_LABEL_JTAG_GET_ID = localize('jtag.action.detect', 'Detect connected JTag ids');

export const ACTION_ID_JTAG_INSTALL_DRIVER = 'workbench.action.jtag.install';
export const ACTION_LABEL_JTAG_INSTALL_DRIVER = localize('jtag.action.install', 'Install driver');
