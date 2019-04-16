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
	ACTION_ID_SHOW_CMAKE_LOG,
	ACTION_LABEL_CMAKE_NO_ERROR,
	ACTION_LABEL_MAIX_CMAKE_BUILD,
	ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG,
	ACTION_LABEL_MAIX_CMAKE_BUILD_RUN,
	ACTION_LABEL_MAIX_CMAKE_CLEANUP,
	ACTION_LABEL_MAIX_SERIAL_BOOT,
	ACTION_LABEL_MAIX_SERIAL_BOOT_ISP,
	ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import { CONTEXT_CMAKE_WORKING } from 'vs/kendryte/vs/workbench/cmake/common/contextKey';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { ACTION_ID_SERIAL_MONITOR_TOGGLE, ACTION_LABEL_SERIAL_MONITOR_TOGGLE } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import 'vs/css!./buttonSize';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { Disposable } from 'vs/base/common/lifecycle';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { errorForeground } from 'vs/platform/theme/common/colorRegistry';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { CMakeError, CMakeErrorType } from 'vs/kendryte/vs/workbench/cmake/common/errors';

class KendryteButtonContribution extends Disposable implements IWorkbenchContribution {
	private errorButton: IPublicStatusButton;

	constructor(
		@IKendryteStatusControllerService private readonly statusControl: IKendryteStatusControllerService,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@ISerialPortService private readonly serialPortService: ISerialPortService,
		@IThemeService private readonly themeService: IThemeService,
	) {
		super();
		this.createCMakeButtons();
		this.handleCMakeContext();
		this.createSerialButtons();
	}

	private createSerialButtons() {
		const plugButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		plugButton.text = '$(plug)';

		const openSerialTerminalButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		openSerialTerminalButton.text = '$(terminal)';
		openSerialTerminalButton.tooltip = ACTION_LABEL_SERIAL_MONITOR_TOGGLE;
		openSerialTerminalButton.command = ACTION_ID_SERIAL_MONITOR_TOGGLE;

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
	}

	private createCMakeButtons() {
		const cmakeButtonsShow = CONTEXT_CMAKE_WORKING.isEqualTo(false as any);

		const cmakeButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		cmakeButton.text = '$(book)';
		cmakeButton.tooltip = localize('cmake', 'CMake');
		// cmakeButton.command = ACTION_ID_MAIX_CMAKE_CONFIGURE;
		cmakeButton.contextKey = cmakeButtonsShow;

		const errorButton = this.errorButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		errorButton.text = '$(alert)';
		errorButton.tooltip = ACTION_LABEL_CMAKE_NO_ERROR;
		// errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
		errorButton.contextKey = cmakeButtonsShow;

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

		this._register(this.themeService.onThemeChange(() => {
			this.updateErrorButtonColor();
		}));
		this.cmakeService.onCMakeProjectChange((e) => {
			if (e) {
				errorButton.text = '$(alert)';
				errorButton.tooltip = localize('error', 'CMake Error: {0}', e.message);

				if (e instanceof CMakeError) {
					switch (e.type) {
						case CMakeErrorType.NO_WORKSPACE:
							errorButton.command = 'workbench.action.files.openFolder';
							break;
						case CMakeErrorType.PROJECT_NOT_EXISTS:
							errorButton.command = ACTION_ID_MAIX_CMAKE_HELLO_WORLD;
							break;
						default:
							errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
					}
				} else {
					errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
				}
			} else {
				errorButton.text = '$(check)';
				errorButton.command = undefined as any;
				errorButton.tooltip = ACTION_LABEL_CMAKE_NO_ERROR;
			}
			this.updateErrorButtonColor();
		});
	}

	private updateErrorButtonColor() {
		if (this.errorButton.command) {
			const color = this.themeService.getTheme().getColor(errorForeground);
			if (color) {
				this.errorButton.color = color.toString();
			} else {
				this.errorButton.color = '#f00';
			}
		} else {
			this.errorButton.color = undefined as any;
		}
	}
}

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(KendryteButtonContribution, LifecyclePhase.Ready);
