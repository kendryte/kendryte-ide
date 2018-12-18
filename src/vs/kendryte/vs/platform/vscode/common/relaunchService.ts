import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IServerChannel } from 'vs/base/parts/ipc/node/ipc';

export interface IKendryteRelaunchChannel extends IServerChannel {
	_serviceBrand: any;
}

export interface IRelaunchService {
	_serviceBrand: any;

	/** @deprecated use lifecycleService */
	relaunch();

	connect(): Promise<void>;
	launchUpdater(): Promise<void>;
	createLogsTarball(): Promise<string>;
}

export const IRelaunchService = createDecorator<IRelaunchService>('relaunchService');
