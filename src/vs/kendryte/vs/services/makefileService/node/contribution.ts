import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IMakefileService } from 'vs/kendryte/vs/services/makefileService/common/type';
import { MakefileService } from 'vs/kendryte/vs/services/makefileService/node/makefileService';
import { registerExternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { CreateCMakeListsAction } from 'vs/kendryte/vs/services/makefileService/common/createCMakeListsAction';
import { ACTION_CATEGORY_BUILD_DEBUG } from 'vs/kendryte/vs/base/common/menu/cmake';

registerSingleton(IMakefileService, MakefileService);
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, CreateCMakeListsAction);