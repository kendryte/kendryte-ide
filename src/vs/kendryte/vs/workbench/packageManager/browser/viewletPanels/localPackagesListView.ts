import { IViewletPanelOptions, ViewletPanel } from 'vs/workbench/browser/parts/views/panelViewlet';
import { WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IExtension } from 'vs/workbench/parts/extensions/common/extensions';
import {
	IPackage,
	IPackageRegistryService,
	PACKAGE_MANAGER_VIEW_ID_EXAMPLE,
	PACKAGE_MANAGER_VIEW_ID_LIBRARY,
	PackageTypes,
} from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { $, append } from 'vs/base/browser/dom';
import { IPagedModel, PagedModel } from 'vs/base/common/paging';
import { TPromise } from 'vs/base/common/winjs.base';

const templateId = 'package';

class Delegate implements IVirtualDelegate<IExtension> {
	getHeight() { return 62; }

	getTemplateId() { return templateId; }
}

interface ITemplateData {
}

export class Renderer implements IPagedRenderer<IPackage, ITemplateData> {
	templateId = templateId;

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		return undefined;
	}

	public renderElement(element: IPackage, index: number, templateData: ITemplateData): void {
	}

	public disposeElement(element: IPackage, index: number, templateData: ITemplateData): void {
	}

	public disposeTemplate(templateData: ITemplateData): void {
	}

}

export class LocalPackagesListView extends ViewletPanel {
	private list: WorkbenchPagedList<IPackage>;
	private packageList: HTMLElement;

	constructor(
		options: IViewletViewOptions,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IPackageRegistryService private readonly packageRegistryService: IPackageRegistryService,
	) {
		super({ ...(options as IViewletPanelOptions), ariaHeaderLabel: options.title }, keybindingService, contextMenuService, configurationService);

	}

	protected renderBody(container: HTMLElement): void {
		this.packageList = append(container, $('.packages-list'));

		const delegate = new Delegate();
		const renderer = this.instantiationService.createInstance(Renderer);
		this.list = this.instantiationService.createInstance(WorkbenchPagedList, this.packageList, delegate, [renderer], {
			ariaLabel: localize('packages', 'Packages'),
			multipleSelectionSupport: false,
		}) as WorkbenchPagedList<IPackage>;
		this.disposables.push(this.list);
	}

	protected layoutBody(size: number): void {
		this.packageList.style.height = size + 'px';
		this.list.layout(size);
	}

	async show(myId: string): TPromise<IPagedModel<IPackage>> {
		let type: PackageTypes;
		switch (myId) {
			case PACKAGE_MANAGER_VIEW_ID_EXAMPLE:
				type = PackageTypes.Example;
				break;
			case PACKAGE_MANAGER_VIEW_ID_LIBRARY:
				type = PackageTypes.Library;
				break;
		}
		return new PagedModel(await this.packageRegistryService.listLocal(type));
	}
}