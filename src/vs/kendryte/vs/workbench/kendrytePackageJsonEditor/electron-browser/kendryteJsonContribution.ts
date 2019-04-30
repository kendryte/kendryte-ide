import { KendrytePackageJsonEditor } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditor';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/kendrytePackageJsonEditorService';
import { KendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/browser/kendrytePackageJsonEditorService';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenPackageJsonEditorAction } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/openEditor';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';
import { registerJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/registerEditorType';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { KENDRYTE_PACKAGE_JSON_EDITOR_ID, KENDRYTE_PACKAGE_JSON_EDITOR_TITLE } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';

registerJsonEditor(
	{ id: KENDRYTE_PACKAGE_JSON_EDITOR_ID, title: KENDRYTE_PACKAGE_JSON_EDITOR_TITLE },
	CMAKE_CONFIG_FILE_NAME,
	KendrytePackageJsonEditor,
	KendrytePackageJsonEditorInput,
);

registerSingleton(IKendrytePackageJsonEditorService, KendrytePackageJsonEditorService);
registerExternalAction(ACTION_CATEGORY_TOOLS, OpenPackageJsonEditorAction);
