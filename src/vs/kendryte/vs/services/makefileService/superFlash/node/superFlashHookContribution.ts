import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { Disposable } from 'vs/base/common/lifecycle';
import { IMakefileService } from 'vs/kendryte/vs/services/makefileService/common/type';
import { ISuperFlashService } from 'vs/kendryte/vs/services/makefileService/superFlash/node/superFlashService';

class SuperFlashHookContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IMakefileService makefileService: IMakefileService,
		@ISuperFlashService superFlashService: ISuperFlashService,
	) {
		super();
		this._register(
			makefileService.onPrepareBuild((event) => {
				event.waitUntil(superFlashService.handlePrecompileEvent(event));
			}),
		);
	}
}

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(SuperFlashHookContribution, LifecyclePhase.Restored);
