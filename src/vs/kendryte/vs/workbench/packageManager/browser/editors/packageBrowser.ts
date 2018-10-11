import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { localize } from 'vs/nls';
import { vsiconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { PANEL_BACKGROUND } from 'vs/workbench/common/theme';
import { SimpleNavBar } from 'vs/kendryte/vs/workbench/commonBlocks/browser/simpleNavBar';
import { IPackageRegistryService, PackageTypes } from 'vs/kendryte/vs/workbench/packageManager/common/type';

export class PackageBrowserEditor extends BaseEditor {
	static readonly ID: string = 'workbench.editor.package-market';
	private $title: HTMLElement;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
	) {
		super(PackageBrowserEditor.ID, telemetryService, themeService);
	}

	updateStyles() {
		super.updateStyles();
		this.$title.style.backgroundColor = this.getColor(PANEL_BACKGROUND, (color, theme) => {
			return color.transparent(0.7);
		});
	}

	getTitle() {
		return localize('packages.browser', 'Package Browser');
	}

	protected createEditor(parent: HTMLElement): void {
		parent.classList.add('package-manager');

		const $title = this.$title = append(parent, $('div.title-bar'));
		this.createTitle($title);

		const $content = append(parent, $('div.content'));
		this.createList($content);

		this.updateStyles();
	}

	private createTitle(parent: HTMLElement) {
		parent.style.borderTop = '1px solid transparent';

		append(parent, $('h1')).textContent = this.getTitle();

		const navbar = this._register(new SimpleNavBar(parent));

		navbar.push(PackageTypes.Library, localize('library', 'Library'), vsiconClass('library'), '');
		navbar.push(PackageTypes.Example, localize('example', 'Example'), vsiconClass('example'), '');

		this._register(navbar.onChange(({ id }) => this.onTabChange(id as PackageTypes)));
	}

	private createList(parent: HTMLElement) {

		this.onTabChange(PackageTypes.Library);
	}

	public layout(dimension: Dimension): void {
	}

	private onTabChange(id: PackageTypes) {
		this.packageRegistryService.queryPackages(id, '', 1);
	}
}