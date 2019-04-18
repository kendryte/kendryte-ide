import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { registerFlashSchemas } from 'vs/kendryte/vs/base/common/jsonSchemas/flashSectionsSchema';
import { Extensions as JSONExtensions, IJSONContributionRegistry } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { FlashManagerHandlerContribution } from 'vs/kendryte/vs/workbench/flashManager/common/registerEditorHandler';

const workbenchContributionsRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(FlashManagerHandlerContribution, LifecyclePhase.Starting);

registerFlashSchemas((id, schema) => {
	Registry.as<IJSONContributionRegistry>(JSONExtensions.JSONContribution).registerSchema(id, schema);
});
