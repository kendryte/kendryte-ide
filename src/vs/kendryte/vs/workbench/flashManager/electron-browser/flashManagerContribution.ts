import { Registry } from 'vs/platform/registry/common/platform';
import { flashSchemaId, registerFlashSchemas } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { registerExternalAction, registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { ACTION_CATEGORY_TOOLS } from 'vs/kendryte/vs/base/common/menu/tools';
import { OpenFlashManagerAction } from 'vs/kendryte/vs/workbench/flashManager/common/openFlashManagerAction';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { FlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/node/flashManagerService';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/common/editorInput';
import { FlashManagerEditor } from 'vs/kendryte/vs/workbench/flashManager/browser/flashManagerEditor';
import { FlashAllAction } from 'vs/kendryte/vs/workbench/flashManager/node/flashAllAction';
import { localize } from 'vs/nls';
import { CreateZipAction, CreateZipWithProgramAction } from 'vs/kendryte/vs/workbench/flashManager/node/createZipAction';
import { CustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';
import { FLASH_MANAGER_CONFIG_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { KENDRYTE_FLASH_MANAGER_ID, KENDRYTE_FLASH_MANAGER_TITLE } from 'vs/kendryte/vs/workbench/flashManager/common/type';

registerFlashSchemas((id, schema) => {
	Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution).registerSchema(id, schema);
});

CustomJsonRegistry.registerCustomEditor(
	KENDRYTE_FLASH_MANAGER_ID,
	KENDRYTE_FLASH_MANAGER_TITLE,
	FlashManagerEditor,
	FlashManagerEditorInput,
);
CustomJsonRegistry.registerCustomJson(KENDRYTE_FLASH_MANAGER_ID, `${PROJECT_CONFIG_FOLDER_NAME}/${FLASH_MANAGER_CONFIG_FILE_NAME}`, flashSchemaId);

registerSingleton(IFlashManagerService, FlashManagerService);
registerExternalAction(ACTION_CATEGORY_TOOLS, OpenFlashManagerAction);

const ACTION_CATEGORY_FLASH_MANAGER = localize('flashManager', 'Flash Manager');
registerExternalAction(ACTION_CATEGORY_FLASH_MANAGER, FlashAllAction);
registerExternalAction(ACTION_CATEGORY_FLASH_MANAGER, CreateZipAction);
registerInternalAction(ACTION_CATEGORY_FLASH_MANAGER, CreateZipWithProgramAction);
