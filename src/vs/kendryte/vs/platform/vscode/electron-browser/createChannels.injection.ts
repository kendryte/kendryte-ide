import { IChannel, IPCClient } from 'vs/base/parts/ipc/node/ipc';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { _getChannelDecorators } from 'vs/kendryte/vs/platform/instantiation/node/ipcExtensions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { KENDRYTE_ACTIONID_BOOTSTRAP } from 'vs/kendryte/vs/platform/vscode/common/actionId';
import { kendryteConfigRegisterSerialPort } from 'vs/kendryte/vs/workbench/serialPort/node/configContribution';
import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { kendryteConfigRegisterFTDI } from 'vs/kendryte/vs/platform/openocd/common/ftdi';
import { kendryteConfigRegisterOpenOCD } from 'vs/kendryte/vs/platform/openocd/common/openocd';
import { kendryteConfigRegisterJTag } from 'vs/kendryte/vs/platform/openocd/common/jtag';
import { kendryteConfigRegisterOCDCustom } from 'vs/kendryte/vs/platform/openocd/common/custom';
import { IWindowService } from 'vs/platform/windows/common/windows';

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
			const lifecycle = accessor.get<ILifecycleService>(ILifecycleService);
			const command = accessor.get<ICommandService>(ICommandService);
			return Promise.all([
				lifecycle.when(LifecyclePhase.Starting).then(() => {
					return command.executeCommand(KENDRYTE_ACTIONID_BOOTSTRAP);
				}),
				lifecycle.when(LifecyclePhase.Ready).then(async () => {
					kendryteConfigRegisterSerialPort();

					kendryteConfigRegisterOpenOCD();
					kendryteConfigRegisterJTag();
					kendryteConfigRegisterFTDI();
					kendryteConfigRegisterOCDCustom();
				}),
			]);
		}).catch((e) => {
			console.error('Error during startup:', e);
			alert('Error during startup: ' + e.message);
			instantiationService.invokeFunction((accessor) => {
				accessor.get<IWindowService>(IWindowService).openDevTools({
					mode: 'detach',
				});
			});
		});
	});
}