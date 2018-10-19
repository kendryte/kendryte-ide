import { IChannel, IPCClient } from 'vs/base/parts/ipc/node/ipc';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { _getChannelDecorators } from 'vs/kendryte/vs/platform/instantiation/node/ipcExtensions';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { KENDRYTE_ACTIONID_BOOTSTRAP } from 'vs/kendryte/vs/platform/vscode/common/actionId';

export function _kendrite_workbench_hookInstantiationService(
	serviceCollection: ServiceCollection,
	mainProcessClient: IPCClient,
	instantiationService: IInstantiationService,
) {
	for (const id of _getChannelDecorators()) {
		const channel = mainProcessClient.getChannel(id.toString());
		serviceCollection.set<IChannel>(id, channel);
	}

	setImmediate(() => {
		instantiationService.invokeFunction((accessor) => {
			return accessor.get(ICommandService).executeCommand(KENDRYTE_ACTIONID_BOOTSTRAP);
		}).catch((e) => {
			console.error(e);
			instantiationService.invokeFunction((accessor) => {
				accessor.get<IWindowService>(IWindowService).openDevTools({
					mode: 'detach',
				});
			});
		});
	});
}