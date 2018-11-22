import { ILifecycleService } from 'vs/platform/lifecycle/common/lifecycle';
import { StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { StatusBarItem } from 'vs/kendryte/vs/workbench/cmake/common/statusBarButton';
import { StatusBarController } from 'vs/kendryte/vs/workbench/cmake/common/statusBarController';
import { localize } from 'vs/nls';
import {
	ACTION_ID_MAIX_CMAKE_SELECT_TARGET,
	ACTION_ID_MAIX_CMAKE_SELECT_VARIANT,
} from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import {
	ACTION_ID_MAIX_CMAKE_BUILD, ACTION_ID_MAIX_CMAKE_CLEANUP, ACTION_ID_MAIX_CMAKE_CONFIGURE, ACTION_ID_MAIX_CMAKE_RUN,
	ACTION_ID_MAIX_SERIAL_UPLOAD, ACTION_LABEL_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_CLEANUP, ACTION_LABEL_MAIX_CMAKE_RUN, ACTION_LABEL_MAIX_SERIAL_UPLOAD,
} from 'vs/kendryte/vs/base/common/menu/cmake';

let entries: IDisposable[] = [];

export function addStatusBarCmakeButtons(access: ServicesAccessor) {
	const instantiationService: IInstantiationService = access.get(IInstantiationService);
	const lifecycleService: ILifecycleService = access.get(ILifecycleService);

	lifecycleService.onShutdown(() => {
		entries.forEach((item) => {
			dispose(item);
		});
	});

	const selectTip = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.9);
	selectTip.text = '$(book)';
	selectTip.tooltip = localize(
		'and',
		'{0} and {1}',
		localize('cleanup', 'Cleanup'),
		localize('build', 'Build'),
	);
	selectTip.command = ACTION_ID_MAIX_CMAKE_CONFIGURE;

	entries.push(selectTip);

	const selectVariantButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.89);
	selectVariantButton.text = '';
	selectVariantButton.tooltip = localize('debug.select.variant', 'Click to select build variant');
	selectVariantButton.command = ACTION_ID_MAIX_CMAKE_SELECT_VARIANT;
	entries.push(selectVariantButton);

	const selectTargetButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.88);
	selectTargetButton.text = '';
	selectTargetButton.tooltip = localize('debug.select.target', 'Click to select build target');
	selectTargetButton.command = ACTION_ID_MAIX_CMAKE_SELECT_TARGET;
	entries.push(selectTargetButton);

	const cleanButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.8);
	cleanButton.text = '$(trashcan)';
	cleanButton.tooltip = ACTION_LABEL_MAIX_CMAKE_CLEANUP;
	cleanButton.command = ACTION_ID_MAIX_CMAKE_CLEANUP;
	entries.push(cleanButton);

	const buildButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.7);
	buildButton.text = '$(checklist)';
	buildButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD;
	buildButton.command = ACTION_ID_MAIX_CMAKE_BUILD;
	entries.push(buildButton);

	const launchTargetButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.6);
	launchTargetButton.text = '$(triangle-right)';
	launchTargetButton.tooltip = ACTION_LABEL_MAIX_CMAKE_RUN;
	launchTargetButton.command = ACTION_ID_MAIX_CMAKE_RUN;
	entries.push(launchTargetButton);

	const uploadTargetButton = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 3.5);
	uploadTargetButton.text = '$(desktop-download)';
	uploadTargetButton.tooltip = ACTION_LABEL_MAIX_SERIAL_UPLOAD;
	uploadTargetButton.command = ACTION_ID_MAIX_SERIAL_UPLOAD;
	entries.push(uploadTargetButton);

	const statusTip = instantiationService.createInstance(StatusBarItem, StatusbarAlignment.LEFT, 4);
	entries.push(statusTip);

	return new StatusBarController(
		statusTip,
		selectVariantButton,
		selectTargetButton,
		[
			selectTip,
			selectVariantButton,
			selectTargetButton,
			uploadTargetButton,
			launchTargetButton,
			buildButton,
			cleanButton,
		],
	);
}
