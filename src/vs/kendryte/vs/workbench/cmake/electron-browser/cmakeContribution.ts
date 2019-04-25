import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { CMakeService } from 'vs/kendryte/vs/workbench/cmake/electron-browser/cmakeService';
import { MaixCMakeBuildAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/buildAction';
import { MaixCMakeBuildDebugAction, MaixCMakeDebugAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/debugAction';
import { MaixCMakeCleanupAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/cleanupAction';
import { MaixCMakeSelectTargetAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/selectTargetAction';
import { MaixCMakeSelectVariantAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/selectVariantAction';
import { MaixCMakeHelloWorldAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/helloWorldAction';
import { MaixCMakeConfigureAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/configureAction';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { registerExternalAction, registerInternalAction } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';
import { OpenLocalCmakeListAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/openLocalCmakeList';
import { registerCMakeSchemas } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { MaixCMakeBuildRunAction, MaixCMakeRunAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/runAction';
import { ACTION_CATEGORY_BUILD_DEBUG } from 'vs/kendryte/vs/base/common/menu/cmake';
import { MaixCMakeOpenLogAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/openLogAction';
import { CMakeSelectProjectAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/selectProjectAction';

registerSingleton(ICMakeService, CMakeService);

const category = localize('kendryte', 'Kendryte');

// BUILD
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeBuildAction);

// CONFIGURE
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeConfigureAction);

// RUN
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeDebugAction);
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeBuildDebugAction);

registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeRunAction);
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeBuildRunAction);

// clean
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeCleanupAction);

// target select
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeSelectTargetAction);

// target select
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeSelectVariantAction);

// hello world project
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeHelloWorldAction);

// open config file
registerExternalAction(category, OpenLocalCmakeListAction);

// CONFIG json
registerCMakeSchemas((id, schema) => {
	Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution).registerSchema(id, schema);
});

// open log
registerInternalAction(ACTION_CATEGORY_BUILD_DEBUG, MaixCMakeOpenLogAction);

// select project
registerExternalAction(ACTION_CATEGORY_BUILD_DEBUG, CMakeSelectProjectAction);
