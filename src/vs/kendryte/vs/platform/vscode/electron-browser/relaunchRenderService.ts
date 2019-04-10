import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteClientService, MainThreadMethod } from 'vs/kendryte/vs/services/ipc/common/ipcType';

export class RenderRelaunchService implements IRelaunchService {
	_serviceBrand: any;

	constructor(
		@IKendryteClientService channelService: IKendryteClientService,
	) {
		channelService.initService<IRelaunchService>(this, IRelaunchService);
	}

	@MainThreadMethod(IRelaunchService)
	public createLogsTarball(): Promise<string> {
		return null as any;
	}

	@MainThreadMethod(IRelaunchService)
	public connect() {
		return null as any;
	}

	@MainThreadMethod(IRelaunchService)
	public launchUpdater() {
		return null as any;
	}

	@MainThreadMethod(IRelaunchService)
	public relaunch() {
		return null as any;
	}
}

registerSingleton(IRelaunchService, RenderRelaunchService);
