import { IChannel } from 'vs/base/parts/ipc/node/ipc';
import { createChannelDecorator } from 'vs/kendryte/vs/platform/instantiation/node/ipcExtensions';

export const IKendryteMainIpcChannel = createChannelDecorator<IKendryteMainIpcChannel>('kendryte:ipc');

export interface IKendryteMainIpcChannel extends IChannel {
	_serviceBrand: any;
}

export const IKendryteServiceRunnerChannel = createChannelDecorator<IKendryteServiceRunnerChannel>('kendryte:service-rpc');

export interface IKendryteServiceRunnerChannel extends IChannel {
	_serviceBrand: any;
}

