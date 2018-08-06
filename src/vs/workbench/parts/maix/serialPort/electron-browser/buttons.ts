import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SERIAL_MONITOR_COMMAND_ID } from 'vs/workbench/parts/maix/serialPort/terminal/common/terminalCommands';

export function addStatusBarButtons(access: ServicesAccessor) {
	const statusbarService: IStatusbarService = access.get(IStatusbarService);
	const lifecycleService: ILifecycleService = access.get(ILifecycleService);

	let entries: IDisposable[] = [];

	lifecycleService.onShutdown(() => {
		dispose(entries);
	});

	const entry2 = statusbarService.addEntry({
		text: '$(plug) $(terminal)',
		command: SERIAL_MONITOR_COMMAND_ID.TOGGLE,
	}, StatusbarAlignment.RIGHT, 100);
	entries.push(entry2);
}
