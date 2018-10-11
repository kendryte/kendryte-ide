import { IChannel } from 'vs/base/parts/ipc/node/ipc';
import { createDecorator, ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

interface ServiceChannel extends IChannel {
	_serviceBrand: any;
}

const _registry: ServiceIdentifier<ServiceChannel>[] = [];

export function createChannelDecorator<T extends ServiceChannel>(id: string) {
	const ret = createDecorator<T>(id);
	_registry.push(ret);
	return ret;
}

export function _getChannelDecorators() {
	return _registry;
}
