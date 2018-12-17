import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IServerChannel } from 'vs/base/parts/ipc/node/ipc';

export interface IKendryteRelaunchChannel extends IServerChannel {
	_serviceBrand: any;
}

export interface IRelaunchService {
	_serviceBrand: any;

	launchUpdater();
	notifySuccess();

	/** @deprecated use lifecycleService */
	relaunch();
}

export const IRelaunchService = createDecorator<IRelaunchService>('relaunchService');
