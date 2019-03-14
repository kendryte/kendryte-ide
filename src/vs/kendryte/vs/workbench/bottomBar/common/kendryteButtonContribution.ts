import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { IKendryteStatusControllerService, IPublicStatusButton, StatusBarLeftLocation } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import {
	ACTION_ID_MAIX_CMAKE_BUILD,
	ACTION_ID_MAIX_CMAKE_BUILD_DEBUG,
	ACTION_ID_MAIX_CMAKE_BUILD_RUN,
	ACTION_ID_MAIX_CMAKE_CLEANUP,
	ACTION_ID_MAIX_SERIAL_BOOT,
	ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT,
	ACTION_ID_SHOW_LOG,
	ACTION_LABEL_MAIX_CMAKE_BUILD,
	ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG,
	ACTION_LABEL_MAIX_CMAKE_BUILD_RUN,
	ACTION_LABEL_MAIX_CMAKE_CLEANUP,
	ACTION_LABEL_MAIX_SERIAL_BOOT,
	ACTION_LABEL_MAIX_SERIAL_BOOT_ISP,
	ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT,
	ACTION_LABEL_SHOW_LOG,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import {
	ACTION_ID_MAIX_CMAKE_HELLO_WORLD,
	ACTION_ID_MAIX_CMAKE_SELECT_TARGET,
	ACTION_ID_MAIX_CMAKE_SELECT_VARIANT,
	ACTION_LABEL_MAIX_CMAKE_HELLO_WORLD,
} from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { CONTEXT_CMAKE_SEEMS_OK, CONTEXT_CMAKE_WORKING } from 'vs/kendryte/vs/workbench/cmake/common/contextKey';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { CMakeError, CMakeErrorType } from 'vs/kendryte/vs/workbench/cmake/common/errors';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ACTION_ID_SERIAL_MONITOR_TOGGLE, ACTION_LABEL_SERIAL_MONITOR_TOGGLE } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import 'vs/css!./buttonSize';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { Disposable } from 'vs/base/common/lifecycle';

const CMAKE_ERROR_MESSAGE = 'cmake.error.project';

class KendryteButtonContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IKendryteStatusControllerService private readonly statusControl: IKendryteStatusControllerService,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@ISerialPortService private readonly serialPortService: ISerialPortService,
	) {
		super();
		this.createCMakeButtons();
		this.handleCMakeContext();
		this.createSerialButtons();
	}

	private createSerialButtons() {
		const plugButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		plugButton.text = '$(plug)';

		const openTerminalButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		openTerminalButton.text = '$(terminal)';
		openTerminalButton.tooltip = ACTION_LABEL_SERIAL_MONITOR_TOGGLE;
		openTerminalButton.command = ACTION_ID_SERIAL_MONITOR_TOGGLE;

		const rebootButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		rebootButton.text = '$(sync)';
		rebootButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BOOT;
		rebootButton.command = ACTION_ID_MAIX_SERIAL_BOOT;
		rebootButton.arguments = ['program'];

		const ispButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		ispButton.text = 'ISP';
		ispButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BOOT_ISP;
		ispButton.command = ACTION_ID_MAIX_SERIAL_BOOT;
		ispButton.arguments = ['isp'];

		const selectDefaultButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		selectDefaultButton.tooltip = ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT;
		selectDefaultButton.command = ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT;
		this._register(this.serialPortService.onDefaultDeviceChanged(() => {
			this.changeSelection(selectDefaultButton);
		}));
		this.changeSelection(selectDefaultButton);
	}

	private changeSelection(selectDefaultButton: IPublicStatusButton) {
		if (this.serialPortService.lastSelect) {
			selectDefaultButton.text = '$(vs select) - ' + this.serialPortService.lastSelect;
		} else {
			selectDefaultButton.text = '$(vs select)';
		}
	}

	private handleCMakeContext() {
		this.cmakeService.onCMakeProjectChange((e: Error | null) => {
			if (!e) {
				return this.statusControl.resolveMessage(CMAKE_ERROR_MESSAGE);
			}

			const btn = this.statusControl.showMessage(CMAKE_ERROR_MESSAGE);
			switch ((e as CMakeError).type) {
				case CMakeErrorType.NO_WORKSPACE:
					btn.text = '$(file-directory) ' + e.message;
					btn.command = 'workbench.action.files.openFolder';
					btn.tooltip = ACTION_LABEL_SHOW_LOG;
					break;
				case CMakeErrorType.PROJECT_NOT_EXISTS:
					btn.text = '$(plus) ' + e.message;
					btn.command = ACTION_ID_MAIX_CMAKE_HELLO_WORLD;
					btn.tooltip = ACTION_LABEL_MAIX_CMAKE_HELLO_WORLD;
					break;
				case CMakeErrorType.LISTS_TXT_EXISTS:
					btn.text = '$(alert) ' + e.message;
					break;
				default:
					btn.text = '$(alert) ' + e.message;
					btn.command = ACTION_ID_SHOW_LOG;
					btn.tooltip = ACTION_LABEL_SHOW_LOG;
			}
		});
	}

	private createCMakeButtons() {
		const cmakeButtonsShow = ContextKeyExpr.and(
			CONTEXT_CMAKE_SEEMS_OK.isEqualTo(true as any),
			CONTEXT_CMAKE_WORKING.isEqualTo(false as any),
		);

		const cmakeButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		cmakeButton.text = '$(book)';
		cmakeButton.tooltip = localize('cmake', 'CMake');
		// cmakeButton.command = ACTION_ID_MAIX_CMAKE_CONFIGURE;
		cmakeButton.contextKey = cmakeButtonsShow;

		const selectVariantButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		selectVariantButton.text = '<...>';
		selectVariantButton.tooltip = localize('debug.select.variant', 'Click to select build variant');
		selectVariantButton.command = ACTION_ID_MAIX_CMAKE_SELECT_VARIANT;
		selectVariantButton.contextKey = cmakeButtonsShow;

		const selectTargetButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		selectTargetButton.text = '<...>';
		selectTargetButton.tooltip = localize('debug.select.target', 'Click to select build target');
		selectTargetButton.command = ACTION_ID_MAIX_CMAKE_SELECT_TARGET;
		selectTargetButton.contextKey = cmakeButtonsShow;

		const cleanButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		cleanButton.text = '$(trashcan)';
		cleanButton.tooltip = ACTION_LABEL_MAIX_CMAKE_CLEANUP;
		cleanButton.command = ACTION_ID_MAIX_CMAKE_CLEANUP;
		cleanButton.contextKey = cmakeButtonsShow;

		const buildButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		buildButton.text = '$(checklist)';
		buildButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD;
		buildButton.command = ACTION_ID_MAIX_CMAKE_BUILD;
		buildButton.contextKey = cmakeButtonsShow;

		const debugButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		debugButton.text = '$(bug)';
		debugButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG;
		debugButton.command = ACTION_ID_MAIX_CMAKE_BUILD_DEBUG;
		debugButton.contextKey = cmakeButtonsShow;

		const launchButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		launchButton.text = '$(triangle-right)';
		launchButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD_RUN;
		launchButton.command = ACTION_ID_MAIX_CMAKE_BUILD_RUN;
		launchButton.contextKey = cmakeButtonsShow;

		const uploadButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		uploadButton.text = '$(desktop-download)';
		uploadButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD;
		uploadButton.command = ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD;
		uploadButton.contextKey = cmakeButtonsShow;

		this.cmakeService.onCMakeSelectionChange((current) => {
			selectVariantButton.text = current.variant ? `[${current.variant}]` : `<All>`;
			selectTargetButton.text = current.target ? `[${current.target}]` : `<Def>`;
		});
	}
}

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(KendryteButtonContribution, LifecyclePhase.Ready);
