import { IIDEBuildingBlocksService, UpdateList, UpdateListFulfilled } from 'vs/kendryte/vs/services/update/common/type';
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
		channelService.markMethod(IIDEBuildingBlocksService, [
			'fetchUpdateInfo',
			'realRunUpdate',
		]);
		channelService.markEvents(IIDEBuildingBlocksService, [
			'onProgress',
		]);
		this.ipc = channelService.as<IIDEBuildingBlocksService>(IIDEBuildingBlocksService);
	}

	get onProgress(): Event<string> {
		return this.ipc.onProgress;
	}

	public fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList> {
		return this.ipc.fetchUpdateInfo(logger, force);
	}

	public realRunUpdate(data: UpdateListFulfilled): TPromise<void> {
		return this.ipc.realRunUpdate(data);
	}
}

registerSingleton(IIDEBuildingBlocksService, IDEBuildingBlocksService);
