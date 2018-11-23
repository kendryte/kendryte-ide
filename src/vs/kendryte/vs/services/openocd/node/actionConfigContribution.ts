import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_JTAG, ACTION_CATEGORY_OPENOCD } from 'vs/kendryte/vs/base/common/menu/openocd';
import { OpenOCDRestartAction, OpenOCDStartAction, OpenOCDStopAction } from 'vs/kendryte/vs/services/openocd/node/actions/openocdStartStopAction';
import { InstallJTagDriverAction } from 'vs/kendryte/vs/services/openocd/node/actions/jtagBase';
import { DetectJTagIdAction } from 'vs/kendryte/vs/services/openocd/node/actions/jtagFindId';

registerExternalAction(ACTION_CATEGORY_JTAG, DetectJTagIdAction);
registerExternalAction(ACTION_CATEGORY_JTAG, InstallJTagDriverAction);

registerExternalAction(ACTION_CATEGORY_OPENOCD, OpenOCDStartAction);
registerExternalAction(ACTION_CATEGORY_OPENOCD, OpenOCDStopAction);
registerExternalAction(ACTION_CATEGORY_OPENOCD, OpenOCDRestartAction);
