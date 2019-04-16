import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenTerminalAction } from 'vs/kendryte/vs/platform/open/common/openTerminalAction';
import { ACTION_CATEGORY_OPEN } from 'vs/kendryte/vs/platform/open/common/actionIds';
import { ACTION_CATEGORY_WEBLINK } from 'vs/kendryte/vs/base/common/menu/webLink';
import { OpenForumInBrowserAction } from 'vs/kendryte/vs/platform/open/common/openForumInBrowser';

registerExternalAction(ACTION_CATEGORY_OPEN, OpenTerminalAction);
registerExternalAction(ACTION_CATEGORY_WEBLINK, OpenForumInBrowserAction);
