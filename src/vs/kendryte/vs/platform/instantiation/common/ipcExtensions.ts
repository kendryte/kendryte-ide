import { IChannel } from 'vs/base/parts/ipc/common/ipc';
import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IMainProcessService } from 'vs/platform/ipc/electron-browser/mainProcessService';

interface ServiceChannel extends IChannel {
	_serviceBrand: any;
}

const _registry: ServiceIdentifier<ServiceChannel>[] = [];

export function createChannelDecorator<T extends ServiceChannel>(id: string): ServiceIdentifier<T> {
	const ret = createDecorator<T>(id);
	_registry.push(ret);
	return ret;
}

// HACK: create a fake service "class"
export function registerChannelClient<T extends ServiceChannel>(id: ServiceIdentifier<T>) {
	function IpcChannelToMainProcess(mainProcessService: IMainProcessService): IChannel {
		return mainProcessService.getChannel(id.toString());
	}

	IMainProcessService(IpcChannelToMainProcess, undefined, 0);

	registerSingleton<IChannel>(id, IpcChannelToMainProcess as any);
}

export function _getChannelDecorators() {
	return _registry;
}
