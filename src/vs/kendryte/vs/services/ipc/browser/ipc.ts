import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { createChannelDecorator } from 'vs/kendryte/vs/platform/instantiation/common/ipcExtensions';

export interface IKendryteMainIpcChannelClient extends IChannel {
	_serviceBrand: any;
}

export interface IKendryteServiceRunnerChannelClient extends IChannel {
	_serviceBrand: any;
}

export const IKendryteMainIpcChannel = createChannelDecorator<IKendryteMainIpcChannelClient>('kendryte:ipc');
export const IKendryteServiceRunnerChannel = createChannelDecorator<IKendryteServiceRunnerChannelClient>('kendryte:service-rpc');

