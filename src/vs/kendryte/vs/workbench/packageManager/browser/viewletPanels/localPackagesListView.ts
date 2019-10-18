import { IViewletPanelOptions, ViewletPanel } from 'vs/workbench/browser/parts/views/panelViewlet';
import { WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IPackageRegistryService } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { $, addDisposableListener, append } from 'vs/base/browser/dom';
import { PagedModel } from 'vs/base/common/paging';
import { Button } from 'vs/base/browser/ui/button/button';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ILibraryProject } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { DisplayPackageDetailAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/displayPackageDetailAction';
import { ILogService } from 'vs/platform/log/common/log';
import { DeleteDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/deleteDependencyAction';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';

const templateId = 'local-package-list';

class Delegate implements IListVirtualDelegate<ILibraryProject> {
	getHeight() { return 75; }

	getTemplateId() { return templateId; }
}

interface ITemplateData {
	/**@deprecated*/container: HTMLElement;
	name: HTMLDivElement;
	version: HTMLDivElement;
	toDispose: IDisposable[];
	elementToDispose: IDisposable[];
	deleteBtn: HTMLAnchorElement;
	detailBtn: Button;
}

export class Renderer implements IPagedRenderer<ILibraryProject, ITemplateData> {
	templateId = templateId;

	constructor(
		@IThemeService private readonly themeService: IThemeService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ILogService private readonly logService: ILogService,
	) {
	}

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(parent: HTMLElement): ITemplateData {
		const toDispose: IDisposable[] = [];

		const container: HTMLDivElement = append(parent, $('div'));
		container.style.lineHeight = 'initial';
		container.style.padding = '5px 8px';

		const nameDiv: HTMLDivElement = append(container, $('div'));
		nameDiv.style.fontSize = '13px';
		nameDiv.style.fontWeight = 'bold';
		nameDiv.style.overflow = 'hidden';
		nameDiv.style.textOverflow = 'ellipsis';

		const versionDiv: HTMLDivElement = append(container, $('div'));
		versionDiv.style.opacity = '0.85';
		versionDiv.style.fontSize = '80%';
		versionDiv.style.marginTop = '4px';
		versionDiv.style.overflow = 'hidden';
		versionDiv.style.textOverflow = 'ellipsis';
		versionDiv.style.marginBottom = '5px';

		const controls: HTMLDivElement = append(container, $('div'));
		Object.assign(controls.style, <CSSStyleDeclaration>{
			display: 'flex',
			flexDirection: 'row',
			// lineHeight: '24px',
			fontSize: '11px',
			marginTop: '12px',
		});

		const left: HTMLDivElement = append(controls, $('div'));
		left.style.flexGrow = '1';

		const deleteBtn: HTMLAnchorElement = append(left, $('a'));
		deleteBtn.innerHTML = renderOcticons('$(trashcan)');
		// deleteBtn.style.fontSize = '24px';

		const right: HTMLDivElement = append(controls, $('div'));

		const detailBtn = new Button(right);
		detailBtn.element.innerHTML = renderOcticons('$(home) ' + localize('detail', 'Detail'));
		detailBtn.element.style.display = 'block';
		// detailBtn.element.style.paddingLeft = detailBtn.element.style.paddingRight = '6px';
		detailBtn.element.style.padding = '3px 6px';
		detailBtn.element.style.fontSize = '11px';
		const icon = detailBtn.element.childNodes as NodeListOf<HTMLElement>;
		icon[0].style.fontSize = '13px';
		toDispose.push(detailBtn);
		toDispose.push(attachButtonStyler(detailBtn, this.themeService));

		return {
			container,
			name: nameDiv,
			version: versionDiv,
			toDispose,
			elementToDispose: [],
			deleteBtn,
			detailBtn,
		};
	}

	public renderElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
		templateData.name.innerText = element.name;
		templateData.name.title = element.name;
		templateData.version.innerText = element.version;
		templateData.version.title = element.version;

		if (templateData.elementToDispose.length) {
			dispose(templateData.elementToDispose);
			templateData.elementToDispose.length = 0;
		}

		templateData.elementToDispose.push(templateData.detailBtn.onDidClick(() => {
			return this.onClickDetail(element);
		}));
		templateData.elementToDispose.push(addDisposableListener(templateData.deleteBtn, 'click', () => {
			return this.onClickDelete(element);
		}));
	}

	public disposeElement(element: ILibraryProject, index: number, templateData: ITemplateData): void {
		dispose(templateData.elementToDispose);
		templateData.elementToDispose.length = 0;
	}

	public disposeTemplate(templateData: ITemplateData): void {
		dispose(templateData.toDispose);
		templateData.toDispose.length = 0;
	}

	private async onClickDetail(element: ILibraryProject) {
		this.instantiationService.createInstance(DisplayPackageDetailAction, DisplayPackageDetailAction.ID, DisplayPackageDetailAction.LABEL).run(element).then(undefined, (e) => {
			this.logService.error('Error when open detail of ' + element.name + '.');
			this.logService.error(e);
		});
	}

	private onClickDelete(element: ILibraryProject) {
		const act = this.instantiationService.createInstance(DeleteDependencyAction, element.name);
		return act.run().then(() => {
			act.dispose();
		}, () => {
			act.dispose();
		});
	}
}

export class LocalPackagesListView extends ViewletPanel {
	private list: WorkbenchPagedList<ILibraryProject>;
	private packageList: HTMLElement;
	private _visible: boolean = false;

	constructor(
		options: IViewletViewOptions,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IKendryteWorkspaceService kendryteWorkspaceService: IKendryteWorkspaceService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IPackageRegistryService private readonly packageRegistryService: IPackageRegistryService,
	) {
		super({ ...(options as IViewletPanelOptions), ariaHeaderLabel: options.title }, keybindingService, contextMenuService, configurationService, contextKeyService);

		this._register(this.packageRegistryService.onLocalPackageChange(e => this.show()));
		this._register(kendryteWorkspaceService.onCurrentWorkingDirectoryChange(e => this.show()));
	}

	protected renderBody(container: HTMLElement): void {
		this.packageList = append(container, $('.packages-list'));

		const delegate = new Delegate();
		const renderer = this.instantiationService.createInstance(Renderer);
		this.list = this.instantiationService.createInstance(WorkbenchPagedList, 'kendryte-package-local', this.packageList, delegate, [renderer], {
			ariaLabel: localize('packages', 'Packages'),
			multipleSelectionSupport: false,
		}) as WorkbenchPagedList<ILibraryProject>;
		this._register(this.list);
	}

	protected layoutBody(size: number): void {
		this.packageList.style.height = size + 'px';
		this.list.layout(size);
	}

	public setVisible(visible: boolean): void {
		super.setVisible(visible);
		if (this._visible !== visible) {
			this._visible = visible;
		}
		this.show();
	}

	async show(): Promise<void> {
		if (!this._visible) {
			return;
		}
		this.list.model = new PagedModel(await this.packageRegistryService.listLocal());
	}
}
