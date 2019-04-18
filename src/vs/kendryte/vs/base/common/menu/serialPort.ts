import { localize } from 'vs/nls';
import { ACTION_LABEL_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';

export const ACTION_CATEGORY_SERIAL_PORT = localize('serialport', 'Serial Port');

export const ACTION_ID_MAIX_SERIAL_UPLOAD = 'workbench.action.kendryte.upload';
export const ACTION_LABEL_MAIX_SERIAL_UPLOAD = localize('upload', 'Upload');
export const ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD = 'workbench.action.kendryte.build-upload';
export const ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD = localize('and', '{0} and {1}', ACTION_LABEL_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_SERIAL_UPLOAD);

export const ACTION_ID_MAIX_SERIAL_BOOT = 'workbench.action.kendryte.reboot';
export const ACTION_LABEL_MAIX_SERIAL_BOOT = localize('reboot', 'Reboot');
export const ACTION_ID_MAIX_SERIAL_BOOT_ISP = 'workbench.action.kendryte.reboot.isp';
export const ACTION_LABEL_MAIX_SERIAL_BOOT_ISP = localize('reboot.to.ISP.mode', 'Reboot to ISP mode');

export const ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT = 'workbench.action.kendryte.default-serial-port';
export const ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT = localize('kendryte.serial-port.default', 'Click to select default serial port for flasher');
