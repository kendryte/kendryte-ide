import { MaixSerialBuildUploadAction, MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialUpload/node/uploadAction';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';

registerExternalAction(SerialPortActionCategory, MaixSerialUploadAction);
registerExternalAction(SerialPortActionCategory, MaixSerialBuildUploadAction);
