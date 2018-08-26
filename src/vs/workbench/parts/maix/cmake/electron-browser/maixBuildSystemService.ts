import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { EnablementState, IExtensionEnablementService, IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TPromise } from 'vs/base/common/winjs.base';
import { IProgressService2, IProgressStep, ProgressLocation } from 'vs/workbench/services/progress/common/progress';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { IProgress } from 'vs/platform/progress/common/progress';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';

enum ReloadType {
	NO_NEED,
	RELOAD,
	RELAUNCH,
}

let reloadType: ReloadType = ReloadType.NO_NEED;

export function MaixBuildSystemReload(access: ServicesAccessor) {
	switch (reloadType) {
	case ReloadType.RELAUNCH:
		const windowsService: IWindowsService = access.get(IWindowsService);
		return windowsService.relaunch({});
	case  ReloadType.RELOAD:
		const windowService: IWindowService = access.get(IWindowService);
		return windowService.reloadWindow();
	}
	return TPromise.as(void 0);
}

export function MaixBuildSystemPrepare(access: ServicesAccessor): TPromise<void> {
	const extensionManagementService: IExtensionManagementService = access.get(IExtensionManagementService);
	const extensionGalleryService: IExtensionGalleryService = access.get(IExtensionGalleryService);
	const extensionEnablementService: IExtensionEnablementService = access.get(IExtensionEnablementService);
	const notificationService: INotificationService = access.get(INotificationService);
	const progressService: IProgressService2 = access.get(IProgressService2);
	const environmentService: IEnvironmentService = access.get(IEnvironmentService);

	return installExtension(
		'twxs.cmake',
		'ms-vscode.cpptools',
		'webfreak.debug',
		'ms-ceintl.vscode-language-pack-zh-hans',
	).then((changed) => {
		if (changed.indexOf('ms-ceintl.vscode-language-pack-zh-hans') !== -1) {
			if (environmentService.isBuilt) {
				reloadType = ReloadType.RELAUNCH;
			} else {
				reloadType = ReloadType.RELOAD;
			}
		} else if (changed.length) {
			reloadType = ReloadType.RELOAD;
		}
	});

	function _installExtension(id: string, reporter: IProgress<IProgressStep>): TPromise<boolean> {
		console.log('install extension %s', id);
		reporter.report({ message: id });
		return extensionGalleryService.query({ names: [id], source: 'install-recommendation', pageSize: 1 }).then(pager => {
			if (pager && pager.firstPage && pager.firstPage.length) {
				reporter.report({ message: id });
				return extensionManagementService.installFromGallery(pager.firstPage[0]);
			}
			return TPromise.wrapError(new Error('Not Found'));
		}).then(() => {
			return true;
		}, (e) => {
			notificationService.error(`Cannot install extension [${id}]: ${e.message}`);
			return false;
		});
	}

	async function installExtension(...ids: string[]): TPromise<string[]> {
		let changed: string[] = [];
		const list = await extensionManagementService.getInstalled();

		for (const item of list) {
			const alreadyExists = ids.indexOf(item.galleryIdentifier.id);
			if (alreadyExists !== -1) {
				ids.splice(alreadyExists, 1);
				if (extensionEnablementService.isEnabled(item)) {
					console.log('extension is already install and enabled: %s', item.identifier.id);
				} else {
					console.log('set extension enabled: %s', item.identifier.id);
					const enableSuccess = await extensionEnablementService.setEnablement(item, EnablementState.Enabled);
					if (enableSuccess) {
						changed.push(item.galleryIdentifier.id);
					} else {
						notificationService.error(`Cannot enable extension: ${alreadyExists}`);
					}
				}
			}
		}

		if (ids.length) {
			await progressService.withProgress({
				location: ProgressLocation.Notification,
				title: 'Installing Extension',
				cancellable: false,
			}, async (progress) => {
				for (const id of ids) {
					const ok = await _installExtension(id, progress);
					if (ok) {
						changed.push(id);
					}
				}
			});
		}

		return changed;
	}

	// function setDebugConfig() {
	// 	if (!this.workspaceContextService.getWorkspace().folders.length) {
	// 		return;
	// 	}
	// 	const resource = this.workspaceContextService.getWorkspace().folders[0].toResource('.vscode/launch.json');
	//
	// 	const launchJson = this.configurationService.getValue<IGlobalConfig>('launch', {
	// 		resource,
	// 	});
	//
	// 	const exists = launchJson.configurations.findIndex((item) => {
	// 		return item.hasOwnProperty('maix');
	// 	});
	//
	// 	// todo: insert startup config?
	//
	// 	if (exists === -1) {
	// 		this.configurationService.updateValue('configurations', {
	// 			resource,
	// 		}, ConfigurationTarget.WORKSPACE);
	// 	}
	// }
}
