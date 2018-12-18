import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { CreateReportAction } from 'vs/kendryte/vs/code/electron-browser/updater/actions/createReportAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';
import { QuitUpdateAction } from 'vs/kendryte/vs/code/electron-browser/updater/actions/quitUpdateAction';
import { RebootAction } from 'vs/kendryte/vs/code/electron-browser/updater/actions/rebootAction';

registerExternalAction(ACTION_CATEGORY_TOOLS, CreateReportAction);
registerExternalAction(ACTION_CATEGORY_TOOLS, QuitUpdateAction);
registerExternalAction(ACTION_CATEGORY_TOOLS, RebootAction);
