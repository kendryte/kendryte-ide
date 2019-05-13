import { registerExternalAction, registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/openPackagesMarketPlaceAction';
import { DisplayPackageDetailAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/displayPackageDetailAction';
import { InstallEveryDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/installDependencyAction';
import { ACTION_CATEGORY_PACKAGE_MANAGER } from 'vs/kendryte/vs/base/common/menu/packageManager';

registerInternalAction(ACTION_CATEGORY_PACKAGE_MANAGER, DisplayPackageDetailAction);
registerExternalAction(ACTION_CATEGORY_PACKAGE_MANAGER, OpenPackagesMarketPlaceAction);
registerExternalAction(ACTION_CATEGORY_PACKAGE_MANAGER, InstallEveryDependencyAction);
