import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IRelaunchMainService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { app } from 'electron';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { writeFileAndFlushSync } from 'vs/base/node/extfs';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { ILifecycleService } from 'vs/platform/lifecycle/electron-main/lifecycleMain';

export class MainProcessRelaunchService implements IRelaunchMainService {
	_serviceBrand: any;
	protected readonly isDebug: boolean;

	constructor(
		@IEnvironmentService environmentService: IEnvironmentService,
		@IWindowsMainService private readonly windowsService: IWindowsMainService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
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
			this.lifecycleService.relaunch({});
		}
	}

	preExit(): Promise<void> {
		app.removeAllListeners('window-all-closed'); // prevent livecycleService handle this, or app will quit
		const p = new Promise<void>((resolve, reject) => {
			app.once('window-all-closed', (e: Event) => { // handle it myself instead
				resolve();
			});
		});
		this.windowsService.getWindows().forEach((win) => { // then, close all window
			win.close(); // livecycleService will notice this, and do any cleanup
		});
		return p;
	}
}

registerMainSingleton(IRelaunchMainService, MainProcessRelaunchService);
