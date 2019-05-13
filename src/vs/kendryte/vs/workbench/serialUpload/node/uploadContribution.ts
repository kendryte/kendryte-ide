import { MaixSerialBuildUploadAction, MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialUpload/node/uploadAction';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_SERIAL_PORT } from 'vs/kendryte/vs/base/common/menu/serialPort';
import { MaixSerialRebootAction, MaixSerialRebootISPAction } from 'vs/kendryte/vs/workbench/serialUpload/node/rebootAction';
import { MaixSerialSelectDefaultAction } from 'vs/kendryte/vs/workbench/serialUpload/node/selectDefaultAction';

registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, MaixSerialUploadAction);
registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, MaixSerialBuildUploadAction);

registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, MaixSerialRebootAction);
registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, MaixSerialRebootISPAction);
registerExternalAction(ACTION_CATEGORY_SERIAL_PORT, MaixSerialSelectDefaultAction);
