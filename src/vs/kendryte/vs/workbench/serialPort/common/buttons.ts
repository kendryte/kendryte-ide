import { ILifecycleService, LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SERIAL_MONITOR_ACTION_TOGGLE } from 'vs/kendryte/vs/workbench/serialPort/common/type';

export function addStatusBarButtons(access: ServicesAccessor) {
	const statusbarService: IStatusbarService = access.get(IStatusbarService);
	const lifecycleService: ILifecycleService = access.get(ILifecycleService);

	let entries: IDisposable[] = [];

	lifecycleService.onShutdown(() => {
		dispose(entries);
	});

	lifecycleService.when(LifecyclePhase.Running).then(() => {
		const entry2 = statusbarService.addEntry({
			text: '$(plug) $(terminal)',
			command: SERIAL_MONITOR_ACTION_TOGGLE,
		}, StatusbarAlignment.RIGHT, 100);

		entries.push(entry2);
	});
}
