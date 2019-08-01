import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IPackageManagerViewlet, PACKAGE_MANAGER_VIEWLET_ID as VIEWLET_ID } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { ViewContainerViewlet } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Action } from 'vs/base/common/actions';
import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/openPackagesMarketPlaceAction';
import { ViewletPanel } from 'vs/workbench/browser/parts/views/panelViewlet';
import { IAddedViewDescriptorRef } from 'vs/workbench/browser/parts/views/views';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';

export class PackageManagerViewlet extends ViewContainerViewlet implements IPackageManagerViewlet {
	private primaryActions: Action[];

	constructor(
		@IConfigurationService configurationService: IConfigurationService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IExtensionService extensionService: IExtensionService,
		@IWorkspaceContextService contextService: IWorkspaceContextService,
		@IEditorProgressService private progressService: IEditorProgressService,
	) {
		super(VIEWLET_ID, `${VIEWLET_ID}.state`, true, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
	}

	getOptimalWidth(): number {
		return 400;
	}

	getActions() {
		if (!this.primaryActions) {
			this.primaryActions = [
				this.instantiationService.createInstance(OpenPackagesMarketPlaceAction, OpenPackagesMarketPlaceAction.ID, OpenPackagesMarketPlaceAction.LABEL),
			];
		}
		return this.primaryActions;
	}

	getSecondaryActions() {
		return this.getActions();
	}

	protected onDidAddViews(added: IAddedViewDescriptorRef[]): ViewletPanel[] {
		const addedViews = super.onDidAddViews(added);
		this.progress(Promise.all(addedViews.map(addedView => (<ViewletPanel & { show: () => void }>addedView).show())));
		return addedViews;
	}

	private progress<T>(promise: Promise<T>): Promise<T> {
		const progressRunner = this.progressService.show(true);
		return promise.finally(() => progressRunner.done());
	}
}
