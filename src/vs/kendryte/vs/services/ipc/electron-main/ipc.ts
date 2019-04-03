import { IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { createChannelDecorator } from 'vs/kendryte/vs/platform/instantiation/common/ipcExtensions';

export interface IKendryteMainIpcChannel extends IServerChannel {
	_serviceBrand: any;
}

export interface IKendryteServiceRunnerChannel extends IServerChannel {
	_serviceBrand: any;
}

export const IKendryteMainIpcChannel = createChannelDecorator<IKendryteMainIpcChannel>('kendryte:ipc');
export const IKendryteServiceRunnerChannel = createChannelDecorator<IKendryteServiceRunnerChannel>('kendryte:service-rpc');
