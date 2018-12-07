import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { writeFileAndFlushSync } from 'vs/base/node/extfs';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { IRelaunchRenderService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';

export class RenderRelaunchService implements IRelaunchRenderService {
	_serviceBrand: any;

	protected readonly isDebug: boolean;

	constructor(
		@IEnvironmentService environmentService: IEnvironmentService,
		@IWindowsService private readonly windowsService: IWindowsService,
	) {
		this.isDebug = !environmentService.isBuilt;
	}

	relaunch() {
		console.log('----------------');
		console.log(' %s # relaunch', this.constructor.name);
		console.log('----------------');
		debugger;
		if (this.isDebug) {
			const file = resolvePath(process.env.TEMP, 'debug-ide-restart.mark');
			writeFileAndFlushSync(file, 'yEs');
			this.windowsService.quit();
		} else {
			this.windowsService.relaunch({});
		}
	}
}

registerSingleton(IRelaunchRenderService, RenderRelaunchService);
