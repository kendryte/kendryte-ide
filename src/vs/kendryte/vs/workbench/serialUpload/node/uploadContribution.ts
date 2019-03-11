import { MaixSerialBuildUploadAction, MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialUpload/node/uploadAction';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';
import { MaixSerialRebootAction } from 'vs/kendryte/vs/workbench/serialUpload/node/rebootAction';
import { MaixSerialSelectDefaultAction } from 'vs/kendryte/vs/workbench/serialUpload/node/selectDefaultAction';

registerExternalAction(SerialPortActionCategory, MaixSerialUploadAction);
registerExternalAction(SerialPortActionCategory, MaixSerialBuildUploadAction);

registerExternalAction(SerialPortActionCategory, MaixSerialRebootAction);
registerExternalAction(SerialPortActionCategory, MaixSerialSelectDefaultAction);
