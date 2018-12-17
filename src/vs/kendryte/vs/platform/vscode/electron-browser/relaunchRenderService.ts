import { IRelaunchService } from 'vs/kendryte/vs/platform/vscode/common/relaunchService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';

export class RenderRelaunchService implements IRelaunchService {
	_serviceBrand: any;
	private readonly ipc: IRelaunchService;

	constructor(
		@IKendryteClientService channelService: IKendryteClientService,
	) {
		this.ipc = channelService.as<IRelaunchService>(IRelaunchService);
	}

	public notifySuccess() {
		this.ipc.notifySuccess();
	}

	public launchUpdater() {
		this.ipc.launchUpdater();
	}

	relaunch() {
		this.ipc.relaunch();
	}
}

registerSingleton(IRelaunchService, RenderRelaunchService);
