import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { CMakeService } from 'vs/kendryte/vs/workbench/cmake/electron-browser/cmakeService';
import { MaixCMakeBuildAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/buildAction';
import { MaixCMakeDebugAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/debugRunAction';
import { MaixCMakeCleanupAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/cleanupAction';
import { MaixCMakeSelectTargetAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/selectTargetAction';
import { MaixCMakeSelectVariantAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/selectVariantAction';
import { MaixCMakeHelloWorldAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/helloWorldAction';
import { MaixCMakeConfigureAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/configureAction';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { registerExternalAction } from 'vs/kendryte/vs/base/common/registerAction';
import { OpenLocalCmakeListAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/openLocalCmakeList';
import { cmakeSchema, cmakeSchemaId } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';

registerSingleton(ICMakeService, CMakeService);

const category = localize('kendryte', 'Kendryte');

// BUILD
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeBuildAction, MaixCMakeBuildAction.ID, MaixCMakeBuildAction.LABEL), 'Kendryte: Build project', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeBuildAction.ID,
		title: `${category}: ${MaixCMakeBuildAction.LABEL}`,
	},
});

// CONFIGURE
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeConfigureAction, MaixCMakeConfigureAction.ID, MaixCMakeDebugAction.LABEL), 'Kendryte: Configure', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeConfigureAction.ID,
		title: `${category}: ${MaixCMakeConfigureAction.LABEL}`,
	},
});

// RUN
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeDebugAction, MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL), 'Kendryte: Start Debug', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeDebugAction.ID,
		title: `${category}: ${MaixCMakeDebugAction.LABEL}`,
	},
});

// clean
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeCleanupAction, MaixCMakeCleanupAction.ID, MaixCMakeCleanupAction.LABEL), 'Kendryte: Cleanup project', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeCleanupAction.ID,
		title: `${category}: ${MaixCMakeCleanupAction.LABEL}`,
	},
});

// target select
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeSelectTargetAction, MaixCMakeSelectTargetAction.ID, MaixCMakeSelectTargetAction.LABEL), 'Kendryte: Select build target', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeSelectTargetAction.ID,
		title: `${category}: ${MaixCMakeSelectTargetAction.LABEL}`,
	},
});

// target select
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeSelectVariantAction, MaixCMakeSelectVariantAction.ID, MaixCMakeSelectVariantAction.LABEL), 'Kendryte: Select build variant', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeSelectVariantAction.ID,
		title: `${category}: ${MaixCMakeSelectVariantAction.LABEL}`,
	},
});

// hello world project
Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixCMakeHelloWorldAction, MaixCMakeHelloWorldAction.ID, MaixCMakeHelloWorldAction.LABEL), 'Kendryte: Create "hello world!" project', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixCMakeHelloWorldAction.ID,
		title: `${category}: ${MaixCMakeHelloWorldAction.LABEL}`,
	},
});

// open config file
registerExternalAction(category, OpenLocalCmakeListAction);

// CONFIG json
const jsonRegistry = Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution);
jsonRegistry.registerSchema(cmakeSchemaId, cmakeSchema);
