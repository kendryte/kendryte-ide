import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenTerminalAction } from 'vs/kendryte/vs/platform/open/common/openTerminalAction';
import { ACTION_CATEGORY_OPEN } from 'vs/kendryte/vs/platform/open/common/actionIds';

registerExternalAction(ACTION_CATEGORY_OPEN, OpenTerminalAction);

