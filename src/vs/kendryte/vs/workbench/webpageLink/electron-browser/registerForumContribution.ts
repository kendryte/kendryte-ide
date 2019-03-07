import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenForumInBrowserAction } from 'vs/kendryte/vs/workbench/webpageLink/electron-browser/forum/openForumInBrowser';
import { ACTION_CATEGORY_WEBLINK } from 'vs/kendryte/vs/base/common/menu/webLink';

registerExternalAction(ACTION_CATEGORY_WEBLINK, OpenForumInBrowserAction);
