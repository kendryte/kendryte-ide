import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/openPackagesMarketPlaceAction';
import { OpenFolderAction } from 'vs/workbench/browser/actions/workspaceActions';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CMAKE_ERROR_REQUIRE_FOLDER } from 'vs/kendryte/vs/workbench/cmake/common/type';

export function throwWorkspaceEmptyError(instantiationService: IInstantiationService, notificationService: INotificationService) {
	notificationService.notify({
		severity: Severity.Error,
		message: CMAKE_ERROR_REQUIRE_FOLDER,
		actions: {
			primary: [
				instantiationService.createInstance(OpenFolderAction, OpenFolderAction.ID, OpenFolderAction.LABEL),
				instantiationService.createInstance(OpenPackagesMarketPlaceAction, OpenPackagesMarketPlaceAction.ID, OpenPackagesMarketPlaceAction.LABEL_EXAMPLE),
			],
		},
	});
	throw new Error(CMAKE_ERROR_REQUIRE_FOLDER);
}
