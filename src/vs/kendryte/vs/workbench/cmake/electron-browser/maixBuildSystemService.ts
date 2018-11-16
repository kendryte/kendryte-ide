import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { EnablementState, IExtensionEnablementService, IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { TPromise } from 'vs/base/common/winjs.base';
import { IProgress, IProgressService2, IProgressStep, ProgressLocation } from 'vs/platform/progress/common/progress';

// TODO: need change to action
export function MaixBuildSystemPrepare(access: ServicesAccessor): TPromise<boolean> {
	const extensionManagementService: IExtensionManagementService = access.get(IExtensionManagementService);
	const extensionGalleryService: IExtensionGalleryService = access.get(IExtensionGalleryService);
	const extensionEnablementService: IExtensionEnablementService = access.get(IExtensionEnablementService);
	const notificationService: INotificationService = access.get(INotificationService);
	const progressService: IProgressService2 = access.get(IProgressService2);

	return installExtension(
		'webfreak.debug',
		'twxs.cmake',
		'ms-vscode.cpptools',
		'ms-ceintl.vscode-language-pack-zh-hans',
	).then((changed) => {
		return changed.length > 0;
	});

	function _installExtension(id: string, reporter: IProgress<IProgressStep>): TPromise<boolean> {
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
}
