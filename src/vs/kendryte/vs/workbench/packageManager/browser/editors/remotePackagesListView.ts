import { IListService, WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { attachListStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { $, append } from 'vs/base/browser/dom';
import { vsiconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';

const TEMPLATE_ID = 'remote-packages';

class ListDelegate implements IVirtualDelegate<number> {
	public getHeight(element: number): number {
		return 90;
	}

	public getTemplateId(element: number): string {
		return TEMPLATE_ID;
	}
}

interface ITemplateData {
	icon: HTMLElement;
	title: HTMLElement;
	disposables: IDisposable[];
}

class ListRenderer implements IPagedRenderer<IRemotePackageInfo, ITemplateData> {
	templateId = TEMPLATE_ID;

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		container.classList.add('package-item');

		const titleLine = append(container, $('div.title'));

		titleLine.style.display = 'flex';
		titleLine.style.flexDirection = 'row';
		titleLine.style.fontSize = '28px';
		titleLine.style.lineHeight = '28px';

		const icon = append(titleLine, $('span.icon'));

		const title = append(titleLine, $('span.h'));
		title.style.flex = '1';

		const disposables = [];
		return {
			icon,
			title,
			disposables,
		};
	}

	public renderElement(element: IRemotePackageInfo, index: number, templateData: ITemplateData): void {
		templateData.title.textContent = element.name;
		templateData.icon.className = 'icon ' + vsiconClass(element.type);
	}

	public disposeElement(element: IRemotePackageInfo, index: number, templateData: ITemplateData): void {
		templateData.title.textContent = '';
	}

	public disposeTemplate(templateData: ITemplateData): void {
		dispose(templateData.disposables);
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
	) {
		super(
			container,
			new ListDelegate,
			[new ListRenderer],
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