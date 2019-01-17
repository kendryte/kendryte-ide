import { IViewletPanelOptions, ViewletPanel } from 'vs/workbench/browser/parts/views/panelViewlet';
import { WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IExtension } from 'vs/workbench/parts/extensions/common/extensions';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { $, append } from 'vs/base/browser/dom';
import { IPagedModel, PagedModel } from 'vs/base/common/paging';
import { TPromise } from 'vs/base/common/winjs.base';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

const templateId = 'local-package-tree';

class Delegate implements IListVirtualDelegate<IExtension> {
	getHeight() { return 62; }

	getTemplateId() { return templateId; }
}

interface ITemplateData {
	container: HTMLElement;
}

export class Renderer implements IPagedRenderer<ILibraryProject, ITemplateData> {
	templateId = templateId;

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		container.innerText = 'xxx';
		return { container };
	}

	public renderElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
		templateData.container.innerText = '!!!' + index;
	}

	public disposeElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
	}

	public disposeTemplate(templateData: ITemplateData): void {
	}

}

export class LocalPackagesTreeView extends ViewletPanel {
	private list: WorkbenchPagedList<ILibraryProject>;
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
			ariaLabel: localize('dependency tree', 'Dependency Tree'),
			multipleSelectionSupport: false,
		}) as WorkbenchPagedList<ILibraryProject>;
		this.disposables.push(this.list);
	}

	protected layoutBody(size: number): void {
		this.packageList.style.height = size + 'px';
		this.list.layout(size);
	}

	async show(): TPromise<IPagedModel<ILibraryProject>> {
		return new PagedModel(await this.packageRegistryService.listLocal());
	}
}