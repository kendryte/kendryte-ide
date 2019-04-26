import { Extensions as WorkbenchExtensions, IWorkbenchContribution, IWorkbenchContributionsRegistry } from 'vs/workbench/common/contributions';
import { IKendryteStatusControllerService, IPublicStatusButton, StatusBarLeftLocation } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import {
	ACTION_ID_MAIX_CMAKE_BUILD,
	ACTION_ID_MAIX_CMAKE_BUILD_DEBUG,
	ACTION_ID_MAIX_CMAKE_BUILD_RUN,
	ACTION_ID_MAIX_CMAKE_CLEANUP,
	ACTION_ID_SHOW_CMAKE_LOG,
	ACTION_LABEL_CMAKE_NO_ERROR,
	ACTION_LABEL_MAIX_CMAKE_BUILD,
	ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG,
	ACTION_LABEL_MAIX_CMAKE_BUILD_RUN,
	ACTION_LABEL_MAIX_CMAKE_CLEANUP,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import {
	ACTION_ID_MAIX_SERIAL_BOOT,
	ACTION_ID_MAIX_SERIAL_BOOT_ISP,
	ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT,
	ACTION_LABEL_MAIX_SERIAL_BOOT,
	ACTION_LABEL_MAIX_SERIAL_BOOT_ISP,
	ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD,
	ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT,
} from 'vs/kendryte/vs/base/common/menu/serialPort';
import { Registry } from 'vs/platform/registry/common/platform';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';
import { localize } from 'vs/nls';
import { CONTEXT_CMAKE_CURRENT_IS_PROJECT } from 'vs/kendryte/vs/workbench/cmake/common/contextKey';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { ACTION_ID_SERIAL_MONITOR_TOGGLE, ACTION_LABEL_SERIAL_MONITOR_TOGGLE } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import 'vs/css!./buttonSize';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { Disposable } from 'vs/base/common/lifecycle';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { errorForeground } from 'vs/platform/theme/common/colorRegistry';
import { ACTION_ID_SELECT_FOLDER, ACTION_LABEL_SELECT_FOLDER } from 'vs/kendryte/vs/services/workspace/common/actionId';
import { CONTEXT_KENDRYTE_MULTIPLE_PROJECT } from 'vs/kendryte/vs/services/workspace/common/contextKey';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { basename } from 'vs/base/common/path';

class KendryteButtonContribution extends Disposable implements IWorkbenchContribution {
	private currentHasError: boolean = false;

	constructor(
		@IKendryteStatusControllerService private readonly statusControl: IKendryteStatusControllerService,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@ISerialPortService private readonly serialPortService: ISerialPortService,
		@IThemeService private readonly themeService: IThemeService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
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

		const ispButton = this.statusControl.createInstance(StatusBarLeftLocation.SERIAL);
		ispButton.text = 'ISP';
		ispButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BOOT_ISP;
		ispButton.command = ACTION_ID_MAIX_SERIAL_BOOT_ISP;

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
		const cmakeButtonsShow = CONTEXT_CMAKE_CURRENT_IS_PROJECT.isEqualTo(false as any);
		const folderSelectShow = CONTEXT_KENDRYTE_MULTIPLE_PROJECT.isEqualTo(true as any);

		const cmakeButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		cmakeButton.text = '$(book)';
		cmakeButton.tooltip = localize('cmake', 'CMake');
		// cmakeButton.command = ACTION_ID_MAIX_CMAKE_CONFIGURE;
		cmakeButton.contextKey = cmakeButtonsShow;

		const errorButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		errorButton.text = '$(alert)';
		errorButton.tooltip = ACTION_LABEL_CMAKE_NO_ERROR;
		errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
		errorButton.contextKey = cmakeButtonsShow;

		const workspaceButton = this.statusControl.createInstance(StatusBarLeftLocation.CMAKE);
		workspaceButton.tooltip = ACTION_LABEL_SELECT_FOLDER;
		workspaceButton.command = ACTION_ID_SELECT_FOLDER;
		workspaceButton.contextKey = folderSelectShow;

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
			this.updateErrorButtonColor(errorButton);
		}));
		this.kendryteWorkspaceService.onCurrentWorkingDirectoryChange((path) => {
			workspaceButton.text = '...';
			if (!path) {
				return;
			}
			this.kendryteWorkspaceService.readProjectSetting(path).then((data) => {
				if (data) {
					workspaceButton.text = data.name;
				} else {
					workspaceButton.text = basename(path);
				}
			});
		});
		this.cmakeService.onCMakeStatusChange((e) => {
			if (e) {
				this.currentHasError = true;
				errorButton.text = '$(alert)';
				errorButton.tooltip = localize('error', 'CMake Error: {0}', e.message);
				errorButton.command = '';
			} else {
				this.currentHasError = false;
				errorButton.text = '$(check)';
				errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
				errorButton.tooltip = ACTION_LABEL_CMAKE_NO_ERROR;
			}
			this.updateErrorButtonColor(errorButton);
		});
	}

	private updateErrorButtonColor(errorButton: IPublicStatusButton) {
		if (this.currentHasError) {
			const color = this.themeService.getTheme().getColor(errorForeground);
			if (color) {
				errorButton.color = color.toString();
			} else {
				errorButton.color = '#f00';
			}
		} else {
			errorButton.color = undefined as any;
		}
	}
}

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(KendryteButtonContribution, LifecyclePhase.Ready);
