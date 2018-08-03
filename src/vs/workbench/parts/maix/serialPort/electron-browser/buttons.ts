import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { SerialPortActionId } from 'vs/workbench/parts/maix/serialPort/common/type';

export function addStatusBarButtons(access: ServicesAccessor) {
	const statusbarService: IStatusbarService = access.get(IStatusbarService);
	const lifecycleService: ILifecycleService = access.get(ILifecycleService);

	let entries: IDisposable[] = [];

	lifecycleService.onShutdown(() => {
		dispose(entries);
	});

	const entry = statusbarService.addEntry({
		text: '$(plug) $(terminal)',
		command: SerialPortActionId,
	}, StatusbarAlignment.RIGHT, 100);
	entries.push(entry);
}
