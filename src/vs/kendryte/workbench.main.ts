//// included by "vs/workbench/workbench.main.ts"

// ipc channel (client)
import 'vs/kendryte/vs/services/ipc/electron-browser/ipcChannelWorkbench';
// Logger
import 'vs/kendryte/vs/services/channelLogger/electron-browser/service';
// Misc Services
import 'vs/kendryte/vs/services/github/node/githubServiceContribution';
import 'vs/kendryte/vs/services/path/electron-browser/contribution';
import 'vs/kendryte/vs/services/fileCompress/electron-browser/contribution';
import 'vs/kendryte/vs/services/fileSystem/node/nodeFileSystemService';
import 'vs/kendryte/vs/services/download/node/nodeRequestService'; // network request
import 'vs/kendryte/vs/services/download/electron-browser/nodeDownloadService'; // download
import 'vs/kendryte/vs/services/download/electron-browser/downloadWithProgressService'; // download
// Update service
import 'vs/kendryte/vs/services/update/electron-browser/ideBuildingBlocksService';
import 'vs/kendryte/vs/services/update/electron-browser/openPackageUpgradeAction';
import 'vs/kendryte/vs/services/update/node/openReleasePageAction';
import 'vs/kendryte/vs/services/update/electron-browser/selfUpdateService';
// Settings sections
import 'vs/kendryte/vs/workbench/config/browser/categoryContribution';
import 'vs/kendryte/vs/workbench/config/electron-browser/pathSettingsContribution';
import 'vs/kendryte/vs/workbench/config/common/openocdSettingsContribution';
import 'vs/kendryte/vs/workbench/config/common/flashSettingsContribution';
import 'vs/kendryte/vs/workbench/config/browser/internalSettingsCategoryContribution';
// Settings Page Patcher
import 'vs/kendryte/vs/workbench/patchSettings2/browser/settingsTreePathcer';
import 'vs/kendryte/vs/workbench/patchSettings2/browser/settingsPage2Pathcer';
// IO Config
import 'vs/kendryte/vs/workbench/fpioaConfig/node/generateorContribution';
import 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaContribution';
import 'vs/kendryte/vs/workbench/fpioaConfig/common/packagings/includeAllContribution';
// Serial Devices
import 'vs/kendryte/vs/workbench/serialPort/node/configContribution';
import 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import 'vs/kendryte/vs/workbench/serialPort/node/reloadAction';
// Serial Upload
import 'vs/kendryte/vs/workbench/serialUpload/node/uploadContribution';
// Serial Monitor
import 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialMonitorPanel';
import 'vs/kendryte/vs/workbench/serialPort/common/serialMonitorActions';
import 'vs/kendryte/vs/workbench/serialPort/electron-browser/actions/register';
// app top menus
import 'vs/kendryte/vs/workbench/topMenu/electron-browser/menuContribution';
import 'vs/kendryte/vs/workbench/topMenu/node/shortcutsContribution';
// cmake
import 'vs/kendryte/vs/workbench/cmake/electron-browser/cmakeContribution';
// Package Manager
import 'vs/kendryte/vs/workbench/packageManager/browser/actionsContribution';
import 'vs/kendryte/vs/workbench/packageManager/electron-browser/mainPanelContribution';