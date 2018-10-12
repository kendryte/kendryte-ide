import { IIDEBuildingBlocksService, UpdateList, UpdateListConfirmed } from 'vs/kendryte/vs/platform/common/type';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteClientService } from 'vs/kendryte/vs/services/ipc/electron-browser/ipcType';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';

class IDEBuildingBlocksService implements IIDEBuildingBlocksService {
	public _serviceBrand: any;
	private readonly ipc: IIDEBuildingBlocksService;

	constructor(
		@IKendryteClientService channelService: IKendryteClientService,
	) {
		this.ipc = channelService.as<IIDEBuildingBlocksService>(IIDEBuildingBlocksService);
	}

	get onProgress(): Event<string> {
		return this.ipc.onProgress;
	}

	public fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		return this.ipc.fetchUpdateInfo(logger, force);
	}

	public markUpdate(data: UpdateListConfirmed): TPromise<void> {
		return this.ipc.markUpdate(data);
	}
}

registerSingleton(IIDEBuildingBlocksService, IDEBuildingBlocksService);
