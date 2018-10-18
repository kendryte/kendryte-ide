import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/openPackagesMarketPlaceAction';
import { OpenFolderAction } from 'vs/workbench/browser/actions/workspaceActions';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';

export function assumeWorkbench(access: ServicesAccessor) {
	if (access.get(IWorkspaceContextService).getWorkbenchState() === WorkbenchState.EMPTY) {
		const instantiationService = access.get(IInstantiationService);
		access.get(INotificationService).notify({
			severity: Severity.Error,
			message: 'You must have a working directory to do that.',
			actions: {
				primary: [
					instantiationService.createInstance(OpenFolderAction, OpenFolderAction.ID, OpenFolderAction.LABEL),
					instantiationService.createInstance(OpenPackagesMarketPlaceAction, OpenPackagesMarketPlaceAction.ID, OpenPackagesMarketPlaceAction.LABEL_EXAMPLE),
				],
			},
		});
		return false;
	} else {
		return true;
	}
}