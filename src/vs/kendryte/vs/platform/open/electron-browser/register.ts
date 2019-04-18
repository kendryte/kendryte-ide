import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_WEBLINK } from 'vs/kendryte/vs/base/common/menu/webLink';
import { OpenForumInBrowserAction } from 'vs/kendryte/vs/platform/open/common/openForumInBrowser';
import { OpenDocumentInBrowser } from 'vs/kendryte/vs/platform/open/common/openDocumentInBrowser';

registerExternalAction(ACTION_CATEGORY_WEBLINK, OpenForumInBrowserAction);
registerExternalAction(ACTION_CATEGORY_WEBLINK, OpenDocumentInBrowser);
