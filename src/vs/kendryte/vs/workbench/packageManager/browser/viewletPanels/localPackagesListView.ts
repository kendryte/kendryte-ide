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
import { Button } from 'vs/base/browser/ui/button/button';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

const templateId = 'local-package-list';

class Delegate implements IListVirtualDelegate<IExtension> {
	getHeight() { return 62; }

	getTemplateId() { return templateId; }
}

interface ITemplateData {
	/**@deprecated*/container: HTMLElement;
	name: HTMLDivElement;
	version: HTMLDivElement;
	toDispose: IDisposable[];
	changeId: (id: string) => void;
}

export class Renderer implements IPagedRenderer<ILibraryProject, ITemplateData> {
	templateId = templateId;

	constructor(
		@IThemeService private readonly themeService: IThemeService,
	) {
	}

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		const toDispose: IDisposable[] = [];
		let id: string;

		const nameDiv: HTMLDivElement = append(container, $('div'));
		const versionDiv: HTMLDivElement = append(container, $('div'));

		const controls: HTMLDivElement = append(container, $('div'));
		Object.assign(controls.style, <CSSStyleDeclaration>{
			display: 'flex',
			flexDirection: 'row',
		});

		const left: HTMLDivElement = append(controls, $('div'));
		left.style.flex = '1';

		const right: HTMLDivElement = append(controls, $('div'));

		const deleteBtn = new Button(left);
		deleteBtn.icon = 'trash';
		toDispose.push(deleteBtn);
		toDispose.push(attachButtonStyler(deleteBtn, this.themeService));
		toDispose.push(deleteBtn.onDidClick(() => {
			console.log('click delete btn', id);
		}));

		const detailBtn = new Button(right);
		deleteBtn.label = localize('detail', 'Detail');
		toDispose.push(detailBtn);
		toDispose.push(attachButtonStyler(detailBtn, this.themeService));
		toDispose.push(detailBtn.onDidClick(() => {
			console.log('click detail btn', id);
		}));

		return {
			container,
			name: nameDiv,
			version: versionDiv,
			toDispose,
			changeId(i: string) {
				id = i;
			},
		};
	}

	public renderElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
		templateData.name.innerText = element.name;
		templateData.version.innerText = element.version;
	}

	public disposeElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
		templateData.changeId('');
	}

	public disposeTemplate(templateData: ITemplateData): void {
		dispose(templateData.toDispose);
	}

}

export class LocalPackagesListView extends ViewletPanel {
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
			ariaLabel: localize('packages', 'Packages'),
			multipleSelectionSupport: false,
		}) as WorkbenchPagedList<ILibraryProject>;
		this.disposables.push(this.list);
	}

	protected layoutBody(size: number): void {
		this.packageList.style.height = size + 'px';
		this.list.layout(size);
	}

	async show(): TPromise<IPagedModel<ILibraryProject>> {
		const model = new PagedModel(await this.packageRegistryService.listLocal());
		this.list.model = model;
		return model;
	}
}