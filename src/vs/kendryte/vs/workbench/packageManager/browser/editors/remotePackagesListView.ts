import { IListService, WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { attachButtonStyler, attachListStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { $, append } from 'vs/base/browser/dom';
import { vsiconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { Button } from 'vs/base/browser/ui/button/button';
import { ISelectData, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { localize } from 'vs/nls';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { DisplayPackageDetailAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/displayPackageDetailAction';
import { IPackageRegistryService, PackageTypes } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IWindowService, IWindowsService } from 'vs/platform/windows/common/windows';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';

const TEMPLATE_ID = 'remote-packages';

class ListDelegate implements IListVirtualDelegate<number> {
	public getHeight(element: number): number {
		return 130;
	}

	public getTemplateId(element: number): string {
		return TEMPLATE_ID;
	}
}

interface ITemplateData {
	icon: HTMLElement;
	title: HTMLElement;
	description: HTMLElement;
	versionsList: SelectBox;
	downloadButton: Button;
	detailButton: Button;

	disposables: IDisposable[];
	elementDisposables: IDisposable[];
}

interface MExt {
	__selected: ISelectData;
	__selections: string[];
	___working: boolean;
}

class ListRenderer implements IPagedRenderer<IRemotePackageInfo, ITemplateData> {
	templateId = TEMPLATE_ID;

	constructor(
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IThemeService private readonly themeService: IThemeService,
		@ILogService private readonly logService: ILogService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IPackageRegistryService private readonly packageRegistryService: IPackageRegistryService,
		@INotificationService private readonly notificationService: INotificationService,
		@IWindowsService private readonly windowsService: IWindowsService,
		@IWindowService private readonly windowService: IWindowService,
		@IWorkspaceContextService private readonly workspaceService: IWorkspaceContextService,
	) {
	}

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(parent: HTMLElement): ITemplateData {
		const disposables: IDisposable[] = [];
		const elementDisposables: IDisposable[] = [];

		const container = append(parent, $('div.package-item'));

		const titleLine = append(container, $('div.title'));
		const icon = append(titleLine, $('span.icon'));
		const title = append(titleLine, $('span.h'));

		const description = append(container, $('div.desc'));

		const actionLine = append(container, $('div.actions'));
		const versionsList = new SelectBox([], 0, this.contextViewService);
		disposables.push(versionsList);
		disposables.push(attachSelectBoxStyler(versionsList, this.themeService));
		versionsList.render(actionLine);

		const downloadButton = new Button(actionLine);
		this.setDownloadState(downloadButton, false);
		disposables.push(downloadButton);
		disposables.push(attachButtonStyler(downloadButton, this.themeService));

		const detailButton = new Button(actionLine);
		detailButton.element.innerHTML = renderOcticons('$(home)　') + localize('detail', 'Detail');
		disposables.push(detailButton);
		disposables.push(attachButtonStyler(detailButton, this.themeService));

		return {
			description,
			versionsList,
			downloadButton,
			detailButton,
			icon,
			title,
			disposables,
			elementDisposables,
		};
	}

	private setDownloadState(button: Button, busy: boolean) {
		if (button.enabled === !busy && button.element.innerHTML) {
			return;
		}
		button.enabled = !busy;
		if (busy) {
			button.element.innerHTML = renderOcticons('$(repo-sync~spin)　') + localize('installing', 'Installing...');
		} else {
			button.element.innerHTML = renderOcticons('$(cloud-download)　') + localize('download', 'Download');
		}
	}

	public renderElement(element: MExt & IRemotePackageInfo, index: number, templateData: ITemplateData): void {
		if (templateData.elementDisposables.length) {
			this.disposeElement(element, index, templateData);
		}

		if (element.icon) {
			templateData.icon.className = 'icon custom';
			templateData.icon.style.backgroundImage = `url(${element.icon})`;
		} else {
			templateData.icon.className = 'icon ' + vsiconClass(element.type);
			templateData.icon.style.backgroundImage = '';
		}
		templateData.title.textContent = element.name || '';
		templateData.description.textContent = element.description || '';

		if (!element.__selections) {
			element.__selections = ['Select version', ...element.versions.map(e => e.versionName)];
			element.__selected = { index: 0, selected: '' };
		}

		templateData.versionsList.setOptions(element.__selections, element.__selected.index, 0);

		this.setDownloadState(templateData.downloadButton, element.___working);

		const update = () => {
			this.renderElement(element, index, templateData);
		};
		templateData.elementDisposables.push(templateData.versionsList.onDidSelect(c => {
			return element.__selected = c;
		}));
		templateData.elementDisposables.push(templateData.downloadButton.onDidClick(() => this.onClickDownload(element.__selected, element, update)));
		templateData.elementDisposables.push(templateData.detailButton.onDidClick(() => this.onClickDetail(element)));
	}

	public disposeElement(element: MExt & IRemotePackageInfo, index: number, templateData: ITemplateData): void {
		dispose(templateData.elementDisposables);
		templateData.elementDisposables.length = 0;
		templateData.downloadButton.element.innerHTML = '';
	}

	public disposeTemplate(templateData: ITemplateData): void {
		dispose(templateData.disposables);
		templateData.disposables.length = 0;
	}

	private onClickDetail(element: IRemotePackageInfo) {
		this.instantiationService.createInstance(DisplayPackageDetailAction, DisplayPackageDetailAction.ID, DisplayPackageDetailAction.LABEL).run(element).then(undefined, (e) => {
			this.logService.error('Error when open url ' + element.homepage + '.');
			this.logService.error(e);
		});
	}

	private onClickDownload(currentSelected: ISelectData, currentElement: MExt & IRemotePackageInfo, update: () => void) {
		if (currentSelected.index <= 0 || currentElement.___working) {
			return;
		}

		currentElement.___working = true;
		update();

		this.doInstall(currentElement, currentSelected.selected).then(() => {
			currentElement.___working = false;
			update();
			this.showMessage();
		}, (e) => {
			currentElement.___working = false;
			update();
			this.showMessage(e);
		});
	}

	private showMessage(e?: Error) {
		if (e) {
			this.notificationService.error(e);
		} else {
			this.notificationService.info('Success!');
		}
	}

	private doInstall(currentElement: MExt & IRemotePackageInfo, selectedVersion: string) {
		if (currentElement.type === PackageTypes.Example) {
			return this.windowsService.showOpenDialog(this.windowService.getCurrentWindowId(), {
				title: 'Select download location',
				properties: ['openDirectory'],
				message: 'a new folder called "' + currentElement.name + '" will be create',
			}).then((p) => {
				if (!p || !p[0]) {
					return '';
				}

				return this.packageRegistryService.installExample(currentElement, selectedVersion, p[0]);
			}).then((path) => {
				if (path) {
					const isEmptyWorkspace = this.workspaceService.getWorkbenchState() === WorkbenchState.EMPTY;
					this.windowService.openWindow([URI.file(path)], { forceNewWindow: !isEmptyWorkspace });
				}
			});
		} else {
			return this.packageRegistryService.installDependency(currentElement, selectedVersion);
		}
	}
}

export class RemotePackagesListView extends WorkbenchPagedList<IRemotePackageInfo> {
	private _toDispose: IDisposable[] = [];

	constructor(
		container: HTMLElement,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IListService listService: IListService,
		@IThemeService themeService: IThemeService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextViewService contextViewService: IContextViewService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super(
			container,
			new ListDelegate,
			[instantiationService.createInstance(ListRenderer)],
			{
				mouseSupport: false,
				keyboardSupport: false,
				verticalScrollMode: ScrollbarVisibility.Visible,
			},
			contextKeyService,
			listService,
			themeService,
			configurationService,
		);
		this._toDispose.push(attachListStyler(this, themeService));
	}

	dispose(): void {
		super.dispose();

		this._toDispose = dispose(this._toDispose);
	}
}