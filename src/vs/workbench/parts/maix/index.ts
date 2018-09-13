//// included by "vs/workbench/workbench.main.ts"

// misc
import 'vs/workbench/parts/maix/_library/node/nodePathService';
import 'vs/workbench/parts/maix/_library/node/nodeRequestService';
import 'vs/workbench/parts/maix/_library/electron-browser/packagesUpdateService';
// Settings sections
import 'vs/workbench/parts/maix/config/browser/categoryContribution';
import 'vs/workbench/parts/maix/config/electron-browser/pathSettingsContribution';
import 'vs/workbench/parts/maix/config/common/openocdSettingsContribution';
import 'vs/workbench/parts/maix/config/common/flashSettingsContribution';
import 'vs/workbench/parts/maix/config/browser/internalSettingsCategoryContribution';
// Settings Page Patcher
import 'vs/workbench/parts/maix/patchSettings2/browser/settingsTreePathcer';
import 'vs/workbench/parts/maix/patchSettings2/browser/settingsPage2Pathcer';
// IO Config
import 'vs/workbench/parts/maix/fpioa-config/node/generateorContribution';
import 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaContribution';
import 'vs/workbench/parts/maix/fpioa-config/common/packagings/includeAllContribution';
// Serial Devices
import 'vs/workbench/parts/maix/serialPort/node/configContribution';
import 'vs/workbench/parts/maix/serialPort/electron-browser/serialService';
import 'vs/workbench/parts/maix/serialPort/node/reloadAction';
// Serial Upload
import 'vs/workbench/parts/maix/serialPort/upload/node/uploadContribution';
// Serial Monitor
import 'vs/workbench/parts/maix/serialPort/terminal/electron-browser/terminal.contribution';
import 'vs/workbench/parts/maix/serialPort/panel/electron-browser/serialPanelContribution';
// menus
import 'vs/workbench/parts/maix/_library/electron-browser/menuContribution';
import 'vs/workbench/parts/maix/_library/node/shortcutsContribution';
// cmake
import 'vs/workbench/parts/maix/cmake/electron-browser/cmakeContribution';