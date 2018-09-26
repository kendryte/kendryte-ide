//// included by "vs/workbench/workbench.main.ts"

// misc
import 'kendryte/vs/platform/node/nodePathService';
import 'kendryte/vs/platform/node/nodeRequestService';
import 'kendryte/vs/platform/electron-browser/packagesUpdateService';
// Settings sections
import 'kendryte/vs/workbench/config/browser/categoryContribution';
import 'kendryte/vs/workbench/config/electron-browser/pathSettingsContribution';
import 'kendryte/vs/workbench/config/common/openocdSettingsContribution';
import 'kendryte/vs/workbench/config/common/flashSettingsContribution';
import 'kendryte/vs/workbench/config/browser/internalSettingsCategoryContribution';
// Settings Page Patcher
import 'kendryte/vs/workbench/patchSettings2/browser/settingsTreePathcer';
import 'kendryte/vs/workbench/patchSettings2/browser/settingsPage2Pathcer';
// IO Config
import 'kendryte/vs/workbench/fpioaConfig/node/generateorContribution';
import 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaContribution';
import 'kendryte/vs/workbench/fpioaConfig/common/packagings/includeAllContribution';
// Serial Devices
import 'kendryte/vs/workbench/serialPort/node/configContribution';
import 'kendryte/vs/workbench/serialPort/electron-browser/serialService';
import 'kendryte/vs/workbench/serialPort/node/reloadAction';
// Serial Upload
import 'kendryte/vs/workbench/serialPort/upload/node/uploadContribution';
// Serial Monitor
import 'kendryte/vs/workbench/serialPort/terminal/electron-browser/terminal.contribution';
import 'kendryte/vs/workbench/serialPort/panel/electron-browser/serialPanelContribution';
// menus
import 'kendryte/vs/platform/electron-browser/menuContribution';
import 'kendryte/vs/platform/node/shortcutsContribution';
// cmake
import 'kendryte/vs/workbench/cmake/electron-browser/cmakeContribution';
// PM
import 'kendryte/vs/workbench/packageManager/node/actionsContribution';
