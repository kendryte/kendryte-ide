import { IChannel, IPCClient } from 'vs/base/parts/ipc/node/ipc';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { _getChannelDecorators } from 'vs/kendryte/vs/platform/instantiation/node/ipcExtensions';

export function _kendrite_workbench_hookInstantiationService(
	serviceCollection: ServiceCollection,
	mainProcessClient: IPCClient,
	instantiationService: IInstantiationService,
) {
	for (const id of _getChannelDecorators()) {
		const channel = mainProcessClient.getChannel(id.toString());
		serviceCollection.set<IChannel>(id, channel);
	}
}
