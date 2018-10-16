import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { IChannelLogger } from 'vs/kendryte/vs/services/channelLogger/common/type';

export type UpdateList = IUpdate[];
export type UpdateListFulfilled = (IUpdate & { downloaded: string })[];

export interface IUpdate {
	name: string;
	version: string;
	downloadUrl: string;
}

export interface IIDEBuildingBlocksService {
	_serviceBrand: any;
	readonly onProgress: Event<string>;

	fetchUpdateInfo(logger: IChannelLogger, force?: boolean): TPromise<UpdateList>;
	realRunUpdate(data: UpdateListFulfilled): TPromise<void>;
}

export const IIDEBuildingBlocksService = createDecorator<IIDEBuildingBlocksService>('ideBuildingBlocksService');
