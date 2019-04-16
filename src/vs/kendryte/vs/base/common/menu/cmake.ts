import { localize } from 'vs/nls';

export const ACTION_CATEGORY_BUILD_DEBUG = localize('and', '{0} and {1}', localize('build', 'Build'), localize('debug', 'Debug'));

export const ACTION_ID_SHOW_CMAKE_LOG = 'workbench.action.kendryte.show-cmake-log';
export const ACTION_LABEL_SHOW_CMAKE_LOG = localize('show.log.cmake', 'Click to show CMake log.');

export const ACTION_ID_MAIX_CMAKE_CLEANUP = 'workbench.action.kendryte.cleanup';
export const ACTION_LABEL_MAIX_CMAKE_CLEANUP = localize('cleanup', 'Cleanup');

export const ACTION_ID_MAIX_CMAKE_CONFIGURE = 'workbench.action.kendryte.configure';
export const ACTION_LABEL_MAIX_CMAKE_CONFIGURE = localize('configure', 'Configure');

export const ACTION_ID_MAIX_CMAKE_BUILD = 'workbench.action.kendryte.build';
export const ACTION_LABEL_MAIX_CMAKE_BUILD = localize('build', 'Build');

export const ACTION_ID_MAIX_CMAKE_RUN = 'workbench.action.kendryte.run';
export const ACTION_LABEL_MAIX_CMAKE_RUN = localize('run', 'Run');
export const ACTION_ID_MAIX_CMAKE_BUILD_RUN = 'workbench.action.kendryte.build-run';
export const ACTION_LABEL_MAIX_CMAKE_BUILD_RUN = localize('and', '{0} and {1}', ACTION_LABEL_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_RUN);

export const ACTION_ID_MAIX_CMAKE_DEBUG = 'workbench.action.kendryte.debug';
export const ACTION_LABEL_MAIX_CMAKE_DEBUG = localize('debug', 'Debug');
export const ACTION_ID_MAIX_CMAKE_BUILD_DEBUG = 'workbench.action.kendryte.build-debug';
export const ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG = localize('and', '{0} and {1}', ACTION_LABEL_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_DEBUG);

export const ACTION_ID_MAIX_SERIAL_UPLOAD = 'workbench.action.kendryte.upload';
export const ACTION_LABEL_MAIX_SERIAL_UPLOAD = localize('upload', 'Upload');
export const ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD = 'workbench.action.kendryte.build-upload';
export const ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD = localize('and', '{0} and {1}', ACTION_LABEL_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_SERIAL_UPLOAD);

export const ACTION_ID_MAIX_SERIAL_BOOT = 'workbench.action.kendryte.reboot';
export const ACTION_LABEL_MAIX_SERIAL_BOOT = localize('reboot', 'Reboot');
export const ACTION_LABEL_MAIX_SERIAL_BOOT_ISP = localize('reboot.to.ISP.mode', 'Reboot to ISP mode');

export const ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT = 'workbench.action.kendryte.default-serial-port';
export const ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT = localize('kendryte.serial-port.default', 'Click to select default serial port for flasher');

export const ACTION_LABEL_CMAKE_NO_ERROR = localize('no.error', 'CMake status OK!');


