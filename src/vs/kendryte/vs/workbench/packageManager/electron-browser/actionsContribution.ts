import { registerExternalAction, registerInternalAction } from 'vs/kendryte/vs/base/common/registerAction';
import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/openPackagesMarketPlaceAction';
import { PACKAGE_MANAGER_TITLE } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { DisplayPackageDetailAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/displayPackageDetailAction';
import { InstallDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/installDependencyAction';

const category = PACKAGE_MANAGER_TITLE;

registerInternalAction(category, DisplayPackageDetailAction);
registerExternalAction(category, OpenPackagesMarketPlaceAction);
registerExternalAction(category, InstallDependencyAction);
