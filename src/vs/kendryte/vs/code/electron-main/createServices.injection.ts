import { Server as ElectronIPCServer } from 'vs/base/parts/ipc/electron-main/ipc.electron-main';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { getMainServices } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';
import { getMainIPCs } from 'vs/kendryte/vs/platform/instantiation/electron-main/mainIpcExtensions';
import { IWindowsService } from 'vs/platform/windows/common/windows';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

export function _kendrite_main_hookInstantiationService(
	serviceCollection: ServiceCollection,
	electronIpcServer: ElectronIPCServer,
	instantiationService: IInstantiationService,
) {
	// register channel
	for (const { id, descriptor } of getMainIPCs()) {
		const ipc = instantiationService.createInstance<any>(descriptor.ctor, ...(descriptor.staticArguments as []));
		electronIpcServer.registerChannel(id.toString(), ipc);
	}

	// register normal services
	for (const { id, descriptor } of getMainServices()) {
		serviceCollection.set(id, descriptor);
	}

	setImmediate(() => {
		instantiationService.invokeFunction((access) => {
			const env = access.get<IEnvironmentService>(IEnvironmentService);

			if (!env.isBuilt) { // open dev tools after load
				const service = access.get<IWindowsService>(IWindowsService);
				service.getWindows().then((ls) => {
					ls.forEach(({ id }) => {
						service.openDevTools(id);
					});
				});
				service.onWindowOpen((id: number) => {
					service.openDevTools(id);
				});
			}
		});
	});
}
