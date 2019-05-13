import { KendrytePackageJsonEditor } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditor';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenPackageJsonEditorAction } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/openPackageJsonEditorAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { KENDRYTE_PACKAGE_JSON_EDITOR_ID, KENDRYTE_PACKAGE_JSON_EDITOR_TITLE } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { CustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';
import { cmakeSchemaId } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

CustomJsonRegistry.registerCustomEditor(
	KENDRYTE_PACKAGE_JSON_EDITOR_ID,
	KENDRYTE_PACKAGE_JSON_EDITOR_TITLE,
	KendrytePackageJsonEditor,
	KendrytePackageJsonEditorInput,
);
CustomJsonRegistry.registerCustomJson(KENDRYTE_PACKAGE_JSON_EDITOR_ID, CMAKE_CONFIG_FILE_NAME, cmakeSchemaId);

registerExternalAction(ACTION_CATEGORY_TOOLS, OpenPackageJsonEditorAction);
