import { IServerChannel } from 'vs/base/parts/ipc/node/ipc';
import { createChannelDecorator } from 'vs/kendryte/vs/platform/instantiation/node/ipcExtensions';

export interface IKendryteMainIpcChannel extends IServerChannel {
	_serviceBrand: any;
}

export interface IKendryteServiceRunnerChannel extends IServerChannel {
	_serviceBrand: any;
}

export const IKendryteMainIpcChannel = createChannelDecorator<IKendryteMainIpcChannel>('kendryte:ipc');
export const IKendryteServiceRunnerChannel = createChannelDecorator<IKendryteServiceRunnerChannel>('kendryte:service-rpc');
