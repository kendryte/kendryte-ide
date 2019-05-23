import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { $, append, Dimension, getTotalHeight } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { localize } from 'vs/nls';
import { visualStudioIconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { PANEL_BACKGROUND } from 'vs/workbench/common/theme';
import { SimpleNavBar } from 'vs/kendryte/vs/workbench/commonDomBlocks/browser/simpleNavBar';
import { IPackageRegistryService, PACKAGE_MANAGER_LOG_CHANNEL_ID } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { IRemotePackageInfo } from 'vs/kendryte/vs/workbench/packageManager/common/distribute';
import { IPager, PagedModel } from 'vs/base/common/paging';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { RemotePackagesListView } from 'vs/kendryte/vs/workbench/packageManager/browser/editors/remotePackagesListView';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { CMakeProjectTypes } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { attachInputBoxStyler } from 'vs/platform/theme/common/styler';

export class PackageBrowserEditor extends BaseEditor {
	static readonly ID: string = 'workbench.editor.package-market';
	private readonly instantiationService: IInstantiationService;

	private $title: HTMLElement;
	private errorMessage: HTMLElement;
	private $list: HTMLElement;
	private list: RemotePackagesListView;
	private container: HTMLElement;
	private logger: ILogService;
	private search: string = '';
	private type: CMakeProjectTypes = CMakeProjectTypes.library;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IPackageRegistryService private packageRegistryService: IPackageRegistryService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@IStorageService storageService: IStorageService,
		@IContextViewService private contextViewProvider: IContextViewService,
	) {
		super(PackageBrowserEditor.ID, telemetryService, themeService, storageService);
		this.logger = channelLogService.createChannel('Package Manager', PACKAGE_MANAGER_LOG_CHANNEL_ID, true);
		const sc = new ServiceCollection([ILogService, this.logger]);
		this.instantiationService = instantiationService.createChild(sc);

		this._register(this.packageRegistryService.onLocalPackageChange(e => this.refreshList()));
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
		this.container = append(parent, $('div#package-manager'));

		const $title = this.$title = append(this.container, $('div.package-title-bar'));
		this.createTitle($title);

		this.errorMessage = append(this.container, $('div.error-message'));
		this.errorMessage.style.display = 'none';

		const $content = this.$list = append(this.container, $('div.package-list-content'));
		this.createList($content);

		this.updateStyles();
	}

	private createTitle(parent: HTMLElement) {
		parent.style.borderTop = '1px solid transparent';

		append(parent, $('h1')).textContent = this.getTitle();

		const navDiv = append(parent, $('div.pm-navbar'));
		const navbar = this._register(new SimpleNavBar(navDiv));

		const searchInput = this._register(new InputBox(append(navDiv, $('div.search')), this.contextViewProvider, {
			placeholder: localize('packageManager.search', 'Search package'),
		}));
		this._register(attachInputBoxStyler(searchInput, this.themeService));
		this._register(searchInput.onDidChange((st) => {
			this.search = st;
			this.refreshList();
		}));

		function onWorkspaceChange(isEmpty: boolean) {
			navbar.clear();
			if (!isEmpty) {
				navbar.push(CMakeProjectTypes.library, localize('library', 'Library'), visualStudioIconClass('library'), '');
			}
			navbar.push(CMakeProjectTypes.example, localize('example', 'Example'), visualStudioIconClass('example'), '');
		}

		this._register(this.kendryteWorkspaceService.workspaceContextService.onDidChangeWorkbenchState((state) => {
			onWorkspaceChange(this.kendryteWorkspaceService.isEmpty());
		}));
		setImmediate(() => {
			onWorkspaceChange(this.kendryteWorkspaceService.isEmpty());
		});

		this._register(navbar.onChange(({ id }) => this.onTabChange(id as CMakeProjectTypes)));
	}

	private createList(parent: HTMLElement) {
		parent.style.display = 'none';

		this.list = this.instantiationService.createInstance(RemotePackagesListView, parent);
		this._register(this.list);
	}

	public layout(dimension: Dimension): void {
		const bodyHeight = dimension.height - getTotalHeight(this.$title);
		this.$list.style.height = bodyHeight + 'px';
		this.list.layout(bodyHeight);
	}

	private onTabChange(type: CMakeProjectTypes) {
		this.logger.info('switchTab(%s)', type);
		this.showError(renderOcticons('$(repo-sync~spin) loading...'));
		this.type = type;
		this.refreshList();
	}

	private refreshList() {
		this.packageRegistryService.queryPackages(this.type, this.search, 1).then((list) => {
			this.updateList(list);
		}, (e) => {
			this.logger.error(e.stack || e);
			this.showError(e.message);
		});
	}

	private showError(e: string) {
		this.errorMessage.innerHTML = e;
		this.errorMessage.style.display = 'block';
		this.$list.style.display = 'none';
	}

	private updateList(list: IPager<IRemotePackageInfo>) {
		this.logger.info('list updated.');
		this.list.model = new PagedModel(list);
		this.errorMessage.style.display = 'none';
		this.$list.style.display = 'block';
	}
}