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
import { CMakeStatus, CONTEXT_CMAKE_STATUS, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { ACTION_ID_SERIAL_MONITOR_TOGGLE, ACTION_LABEL_SERIAL_MONITOR_TOGGLE } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import 'vs/css!./buttonSize';
import { ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { Disposable } from 'vs/base/common/lifecycle';
import { IThemeService, themeColorFromId } from 'vs/platform/theme/common/themeService';
import { ACTION_ID_SELECT_FOLDER, ACTION_LABEL_SELECT_FOLDER } from 'vs/kendryte/vs/services/workspace/common/actionId';
import { CONTEXT_KENDRYTE_MULTIPLE_PROJECT } from 'vs/kendryte/vs/services/workspace/common/contextKey';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { basename } from 'vs/base/common/path';
import { CMakeError, CMakeErrorType } from 'vs/kendryte/vs/workbench/cmake/common/errors';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { MyStatusBarItemNames } from 'vs/kendryte/vs/workbench/bottomBar/common/myStatusBarItemId';
import { STATUS_BAR_HOST_NAME_BACKGROUND, STATUS_BAR_HOST_NAME_FOREGROUND } from 'vs/workbench/common/theme';

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
		const plugButton = this.statusControl.createInstance(MyStatusBarItemNames.SERIAL_LABEL, StatusBarLeftLocation.SERIAL);
		plugButton.text = '$(plug)';
		plugButton.backgroundColor = themeColorFromId(STATUS_BAR_HOST_NAME_BACKGROUND);
		plugButton.color = themeColorFromId(STATUS_BAR_HOST_NAME_FOREGROUND);

		const openSerialTerminalButton = this.statusControl.createInstance(MyStatusBarItemNames.SERIAL_MONITOR, StatusBarLeftLocation.SERIAL);
		openSerialTerminalButton.text = '$(terminal)';
		openSerialTerminalButton.tooltip = ACTION_LABEL_SERIAL_MONITOR_TOGGLE;
		openSerialTerminalButton.command = ACTION_ID_SERIAL_MONITOR_TOGGLE;

		const rebootButton = this.statusControl.createInstance(MyStatusBarItemNames.REBOOT_BUTTON, StatusBarLeftLocation.SERIAL);
		rebootButton.text = '$(sync)';
		rebootButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BOOT;
		rebootButton.command = ACTION_ID_MAIX_SERIAL_BOOT;

		const ispButton = this.statusControl.createInstance(MyStatusBarItemNames.ISP_BUTTON, StatusBarLeftLocation.SERIAL);
		ispButton.text = 'ISP';
		ispButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BOOT_ISP;
		ispButton.command = ACTION_ID_MAIX_SERIAL_BOOT_ISP;

		const selectDefaultButton = this.statusControl.createInstance(MyStatusBarItemNames.SELECT_SERIAL_PORT, StatusBarLeftLocation.SERIAL);
		selectDefaultButton.tooltip = ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT;
		selectDefaultButton.command = ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT;
		this._register(this.serialPortService.onDefaultDeviceChanged(() => {
			this.changeSelection(selectDefaultButton);
		}));
		this.changeSelection(selectDefaultButton);
	}

	private changeSelection(selectDefaultButton: IPublicStatusButton) {
		if (this.serialPortService.lastSelect) {
			selectDefaultButton.text = '$(-vs-select) - ' + this.serialPortService.lastSelect;
		} else {
			selectDefaultButton.text = '$(-vs-select)';
		}
	}

	private handleCMakeContext() {
	}

	private createCMakeButtons() {
		const folderSelectShow = CONTEXT_KENDRYTE_MULTIPLE_PROJECT;
		const showStatus = [CMakeStatus.CONFIGURE_ERROR, CMakeStatus.IDLE, CMakeStatus.MAKE_ERROR];
		const cmakeButtonsShow = ContextKeyExpr.regex(CONTEXT_CMAKE_STATUS.toNegated().keys()[0], new RegExp(`^(${showStatus.map(escapeRegExpCharacters).join('|')})$`));

		const cmakeButton = this.statusControl.createInstance(MyStatusBarItemNames.CMAKE_LABEL, StatusBarLeftLocation.CMAKE);
		cmakeButton.text = '$(book)';
		cmakeButton.tooltip = localize('cmake', 'CMake');
		cmakeButton.backgroundColor = themeColorFromId(STATUS_BAR_HOST_NAME_BACKGROUND);
		cmakeButton.color = themeColorFromId(STATUS_BAR_HOST_NAME_FOREGROUND);
		// cmakeButton.command = ACTION_ID_MAIX_CMAKE_CONFIGURE;

		const okButton = this.statusControl.createInstance(MyStatusBarItemNames.CMAKE_CHECK_SUCCESS, StatusBarLeftLocation.CMAKE);
		okButton.text = '$(check)';
		okButton.tooltip = ACTION_LABEL_CMAKE_NO_ERROR;
		okButton.command = ACTION_ID_SHOW_CMAKE_LOG;
		okButton.hide();

		const errorButton = this.statusControl.createInstance(MyStatusBarItemNames.CMAKE_CHECK_ERROR, StatusBarLeftLocation.CMAKE);
		errorButton.text = '$(alert)';
		errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
		errorButton.hide();

		const workspaceButton = this.statusControl.createInstance(MyStatusBarItemNames.WORKSPACE_SELECTION, StatusBarLeftLocation.CMAKE);
		workspaceButton.tooltip = ACTION_LABEL_SELECT_FOLDER;
		workspaceButton.command = ACTION_ID_SELECT_FOLDER;
		workspaceButton.setContextKey(folderSelectShow);

		const cleanButton = this.statusControl.createInstance(MyStatusBarItemNames.CLEAN_BUTTON, StatusBarLeftLocation.CMAKE);
		cleanButton.text = '$(trashcan)';
		cleanButton.tooltip = ACTION_LABEL_MAIX_CMAKE_CLEANUP;
		cleanButton.command = ACTION_ID_MAIX_CMAKE_CLEANUP;
		cleanButton.setContextKey(cmakeButtonsShow);

		const buildButton = this.statusControl.createInstance(MyStatusBarItemNames.BUILD_BUTTON, StatusBarLeftLocation.CMAKE);
		buildButton.text = '$(-vs-BuilderWhite)';
		buildButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD;
		buildButton.command = ACTION_ID_MAIX_CMAKE_BUILD;
		buildButton.setContextKey(cmakeButtonsShow);

		const debugButton = this.statusControl.createInstance(MyStatusBarItemNames.DEBUG_BUTTON, StatusBarLeftLocation.CMAKE);
		debugButton.text = '$(bug)';
		debugButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD_DEBUG;
		debugButton.command = ACTION_ID_MAIX_CMAKE_BUILD_DEBUG;
		debugButton.setContextKey(cmakeButtonsShow);

		const launchButton = this.statusControl.createInstance(MyStatusBarItemNames.LAUNCH_BUTTON, StatusBarLeftLocation.CMAKE);
		launchButton.text = '$(triangle-right)';
		launchButton.tooltip = ACTION_LABEL_MAIX_CMAKE_BUILD_RUN;
		launchButton.command = ACTION_ID_MAIX_CMAKE_BUILD_RUN;
		launchButton.setContextKey(cmakeButtonsShow);

		const uploadButton = this.statusControl.createInstance(MyStatusBarItemNames.FLASH_BUTTON, StatusBarLeftLocation.CMAKE);
		uploadButton.text = '$(-vs-DownloadWhite)';
		uploadButton.tooltip = ACTION_LABEL_MAIX_SERIAL_BUILD_UPLOAD;
		uploadButton.command = ACTION_ID_MAIX_SERIAL_BUILD_UPLOAD;
		uploadButton.setContextKey(cmakeButtonsShow);

		this._register(this.themeService.onThemeChange(() => {
			this.updateErrorButtonColor(errorButton);
		}));

		this._register(this.kendryteWorkspaceService.onCurrentWorkingDirectoryChange((path) => {
			this.onWorkspaceChange(workspaceButton, path);
		}));
		this.onWorkspaceChange(workspaceButton, this.kendryteWorkspaceService.getCurrentWorkspace());

		this._register(this.cmakeService.onCMakeStatusChange(({ status, error }) => {
			if (error) {
				errorButton.hide();
				this.currentHasError = true;
				errorButton.command = ACTION_ID_SHOW_CMAKE_LOG;
				errorButton.tooltip = localize('cmakeErrorUnknown', 'Click to view CMake logs...');
				if (error instanceof CMakeError) {
					errorButton.text = '$(alert) ' + error.message.substr(0, 100) + (error.message.length > 100 ? '...' : '');
					switch (error.type) {
						case CMakeErrorType.NO_WORKSPACE:
							if (this.kendryteWorkspaceService.isEmpty()) {
								errorButton.command = this.kendryteWorkspaceService.isEmptyWorkspace() ? 'workbench.action.addRootFolder' : 'workbench.action.files.openFolder';
								errorButton.tooltip = localize('cmakeNeedOpenFolder', 'Please open any folder to continue...');
							} // else not known wy
							break;
						case CMakeErrorType.PROJECT_NOT_EXISTS:
							errorButton.command = ACTION_ID_MAIX_CMAKE_HELLO_WORLD;
							errorButton.tooltip = localize('cmakeNeedProject', 'Click to create hello world project...');
							break;
					}
				} else {
					errorButton.text = '$(alert)';
				}
				errorButton.show();
				okButton.hide();
			} else {
				this.currentHasError = false;
				errorButton.hide();
				okButton.show();
			}
			this.updateErrorButtonColor(errorButton);
		}));
	}

	private updateErrorButtonColor(errorButton: IPublicStatusButton) {
		if (this.currentHasError) {
			// const color = this.themeService.getTheme().getColor(errorForeground);
			// if (color) {
			// 	errorButton.color = color.toString();
			// } else {
			// 	errorButton.color = '#f00';
			// }
		} else {
			errorButton.color = undefined as any;
		}
	}

	private onWorkspaceChange(workspaceButton: IPublicStatusButton, path: void | string) {
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
	}
}

const workbenchRegistry = Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(KendryteButtonContribution, LifecyclePhase.Ready);
