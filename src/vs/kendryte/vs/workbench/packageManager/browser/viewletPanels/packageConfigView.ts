import 'vs/css!vs/kendryte/vs/workbench/packageManager/browser/viewletPanels/side-bar';
import { IViewletPanelOptions, ViewletPanel } from 'vs/workbench/browser/parts/views/panelViewlet';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { localize } from 'vs/nls';
import { IExtension } from 'vs/workbench/parts/extensions/common/extensions';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { IPagedRenderer } from 'vs/base/browser/ui/list/listPaging';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { $, addDisposableListener, append } from 'vs/base/browser/dom';
import { IPackageRegistryService, PACKAGE_MANAGER_LOG_CHANNEL_ID } from 'vs/kendryte/vs/workbench/packageManager/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { IJSONResult, INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { IChannelLogger, IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { isUndefinedOrNull } from 'vs/base/common/types';

const templateId = 'local-package-tree';

class Delegate implements IListVirtualDelegate<IExtension> {
	getHeight() { return 32; }

	getTemplateId() { return templateId; }
}

interface IConfigSection {
	key: string;
	value: string;
	type: string;
}

interface ITemplateData {
	name: HTMLSpanElement;
	value: HTMLSpanElement;
	button: HTMLAnchorElement;
	event: IDisposable[];
}

export class Renderer implements IPagedRenderer<IConfigSection, ITemplateData> {
	templateId = templateId;

	private readonly _onValueDidChange = new Emitter<IConfigSection>();
	public readonly onValueDidChange = this._onValueDidChange.event;

	constructor(
		@IQuickInputService private readonly quickInputService: IQuickInputService,
	) {
	}

	public renderPlaceholder(index: number, templateData: ITemplateData): void {
	}

	public renderTemplate(container: HTMLElement): ITemplateData {
		const root = append(container, $('.item'));

		const name = append(root, $('span.name'));
		append(root, $('span.sp')).innerText = '|';
		const value = append(root, $('span.value'));
		const button = append(root, $('a.edit')) as HTMLAnchorElement;
		button.innerHTML = renderOcticons('$(pencil)');

		return {
			name,
			value,
			button,
			event: [],
		};
	}

	public renderElement(element: IConfigSection, index: number, templateData: ITemplateData): void {
		templateData.name.innerText = element.key;
		templateData.value.innerText = element.value;
		const source = new CancellationTokenSource();
		templateData.event.push(source);
		templateData.event.push(addDisposableListener(templateData.button, 'click', () => {
			this.quickInputService.input({
				value: element.value,
				prompt: element.key,
				placeHolder: localize('leave.empty.to.use.default', 'Leave empty to use the default value'),
				validateInput: element.type === 'number' ? validateNumber : undefined,
			}, source.token).then((input) => {
				if (isUndefinedOrNull(input)) {
					return;
				}

				templateData.value.innerText = element.value = input;

				this._onValueDidChange.fire(element);
			});
		}));
	}

	public disposeElement(element: IConfigSection, index: number, templateData: ITemplateData): void {
		dispose(templateData.event);
		templateData.event.length = 0;
	}

	public disposeTemplate(templateData: ITemplateData): void {
		dispose(templateData.event);
		templateData.event.length = 0;
	}
}

function validateNumber(s: string) {
	return Promise.resolve(isNaN(parseFloat(s)) ? 'number required' : '');
}

export class PackageConfigView extends ViewletPanel {
	private list: WorkbenchList<IConfigSection>;
	private packageList: HTMLElement;
	private logger: IChannelLogger;

	constructor(
		options: IViewletViewOptions,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IChannelLogService channelLogService: IChannelLogService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IPackageRegistryService private readonly packageRegistryService: IPackageRegistryService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		super({ ...(options as IViewletPanelOptions), ariaHeaderLabel: options.title }, keybindingService, contextMenuService, configurationService);

		this.logger = channelLogService.createChannel('Package Manager', PACKAGE_MANAGER_LOG_CHANNEL_ID, true);
		this.disposables.push(this.packageRegistryService.onLocalPackageChange(e => this.show()));
	}

	protected renderBody(container: HTMLElement): void {
		this.packageList = append(container, $('.package-config-list'));

		const delegate = new Delegate();
		const renderer = this.instantiationService.createInstance(Renderer);
		this.disposables.push(renderer.onValueDidChange(item => this.writeChange(item)));

		this.list = this.instantiationService.createInstance(WorkbenchList, this.packageList, delegate, [renderer], {
			ariaLabel: localize('dependency tree', 'Dependency Tree'),
			multipleSelectionSupport: false,
		}) as WorkbenchList<IConfigSection>;
		this.disposables.push(this.list);
	}

	protected layoutBody(size: number): void {
		this.packageList.style.height = size + 'px';
		this.list.layout(size);
	}

	async show(): Promise<void> {
		const packages = await this.packageRegistryService.listLocal();
		const localObject: any = {};

		const file = this.nodePathService.getPackageFile();
		if (!file) {
			this.list.splice(0, this.list.length);
			return;
		}
		this.logger.info('reading file: ' + file);
		const { json: current, warnings }: IJSONResult<ICompileInfo> = await this.nodeFileSystemService.readJsonFile<ICompileInfo>(file).catch((e) => {
			this.logger.error(e);
			throw new Error(`parsing dependencies, please check. invalid JSON file "${file}".`);
		});
		if (warnings.length) {
			this.logger.warn('JsonWarn:', warnings);
		}

		const defines = Object.assign(localObject, ...packages.map(e => e.definitions || {}));
		if (current.definitions) {
			Object.assign(localObject, current.definitions);
		}

		const kv = Object.entries(defines).map(([k, v]) => {
			return <IConfigSection>{
				key: k,
				value: '' + v,
				type: typeof v,
			};
		});

		this.list.splice(0, this.list.length, kv);
	}

	private async writeChange(item: IConfigSection) {
		const file = this.nodePathService.getPackageFile();

		const val = item.type === 'number' ? parseFloat(item.value) : item.value;

		await this.nodeFileSystemService.editJsonFile(file, ['definitions', item.key], val);
	}
}