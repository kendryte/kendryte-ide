import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IPackageLocalRemoteInfo, PackageDetailCompletionInput } from 'vs/kendryte/vs/workbench/packageManager/common/editors/packageDetailInput';
import { WebviewElement } from 'vs/workbench/contrib/webview/electron-browser/webviewElement';
import { IWorkbenchLayoutService, Parts } from 'vs/workbench/services/layout/browser/layoutService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { Event } from 'vs/base/common/event';
import { isPromiseCanceledError } from 'vs/base/common/errors';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { vsiconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { InstallSingleDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/installDependencyAction';
import { IRequestService } from 'vs/platform/request/node/request';
import { asText } from 'vs/base/node/request';
import * as marked from 'vs/base/common/marked/marked';
import { ShowCurrentReleaseNotesAction } from 'vs/workbench/contrib/update/electron-browser/update';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import 'vs/css!vs/kendryte/vs/workbench/packageManager/browser/editors/detailPage';
import { DeleteDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/deleteDependencyAction';
import { OpenUrlAction } from 'vs/kendryte/vs/platform/open/common/openUrlAction';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';

const githubUrlReg = /^https?:\/\/github.com\/([^\/]+)\/([^\/]+)/;

export class PackageDetailEditor extends BaseEditor {
	static readonly ID: string = 'workbench.editor.package';

	private icon: HTMLImageElement;
	private name: HTMLSpanElement;
	private description: HTMLDivElement;
	private webviewElement: WebviewElement;
	private actionsBar: ActionBar;
	private version: HTMLSpanElement;
	private elementDisposables: IDisposable[] = [];
	private iconDisable: HTMLSpanElement;
	private dimension: Dimension;
	private content: HTMLDivElement;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IWorkbenchLayoutService private layoutService: IWorkbenchLayoutService,
		@INotificationService private readonly notificationService: INotificationService,
		@IRequestService private readonly requestService: IRequestService,
		@IOpenerService private readonly openerService: IOpenerService,
	) {
		super(PackageDetailEditor.ID, telemetryService, themeService, storageService);
	}

	protected createEditor(parent: HTMLElement): void {
		const root = append(parent, $('.package-editor'));
		const header = append(root, $('.header'));
		this.icon = append(header, $('img.icon', { draggable: false }));
		this.iconDisable = append(header, $('span', { draggable: false }));

		const details = append(header, $('.details'));
		const title = append(details, $('.title'));
		this.name = append(title, $('span.name.clickable', { title: localize('name', 'Package name') }));
		this.version = append(title, $('span.version', { title: localize('version', 'Package Version') }));

		this.description = append(details, $('.description'));

		const extensionActions = append(root, $('.actions'));
		this.actionsBar = new ActionBar(extensionActions, {
			animated: false,
		});
		this._register(this.actionsBar);

		Event.chain(this.actionsBar.onDidRun)
			.map(({ error }) => error)
			.filter(error => !!error)
			.on(this.onError, this, this._toDispose);

		this.webviewElement = this.instantiationService.createInstance(
			WebviewElement,
			this.layoutService.getContainer(Parts.EDITOR_PART),
			{
				allowSvgs: false,
			},
			{
				allowScripts: false,
			},
		);
		this._register(this.webviewElement);

		append(root, $('hr'));

		this.content = append(root, $('.content'));
		this.webviewElement.mountTo(this.content);
	}

	private onError(err: Error) {
		if (isPromiseCanceledError(err)) {
			return;
		}

		this.notificationService.error(err);
	}

	async setInput(input: PackageDetailCompletionInput, options: EditorOptions, token: CancellationToken): Promise<void> {
		super.setInput(input, options, token);

		this.actionsBar.clear();
		dispose(this.elementDisposables);
		this.webviewElement.contents = '';
		this.elementDisposables.length = 0;
		this.icon.style.display = 'none';
		this.iconDisable.style.display = 'none';
		this.name.innerText = '';
		this.description.innerText = '';
		this.version.innerText = '';

		const data: IPackageLocalRemoteInfo = await input.resolve();

		if (data.remote) {
			if (data.remote.icon) {
				this.icon.src = data.remote.icon;
				this.icon.style.display = 'initial';
			} else {
				this.iconDisable.className = 'icon no ' + vsiconClass(assertNotNull(data.local).type);
				this.iconDisable.style.display = 'initial';
			}

			this.name.innerText = data.remote.name;
			this.description.innerText = data.remote.description || localize('no.description', 'No description');
			this.version.innerText = data.local ? data.local.version : localize('not.install', 'Not Installed');
		} else if (data.local) {
			this.iconDisable.className = 'icon no ' + vsiconClass(data.local.type);
			this.iconDisable.style.display = 'initial';
			this.name.innerText = data.local.name;
			this.description.innerText = localize('local.package', 'Local package');
			this.version.innerText = data.local.version;
		}

		if (data.remote) {
			const label = data.local
				? localize('ReinstallDependency', 'Reinstall package')
				: localize('InstallDependency', 'Install package');

			const install = this.instantiationService.createInstance(InstallSingleDependencyAction, label, false, data.remote);
			const installVersion = this.instantiationService.createInstance(InstallSingleDependencyAction, label + '...', true, data.remote);
			this.elementDisposables.push(install);
			this.elementDisposables.push(installVersion);
			this.actionsBar.push(install);
			this.actionsBar.push(installVersion);
		}

		if (data.local) {
			const eraseAction = this.instantiationService.createInstance(DeleteDependencyAction, data.local.name);
			this.elementDisposables.push(eraseAction);
			this.actionsBar.push(eraseAction);
		}

		if (data.remote && data.remote.homepage) {
			const openHome = this.instantiationService.createInstance(OpenUrlAction, localize('open.homepage', 'Open homepage'), data.remote.homepage);
			this.elementDisposables.push(openHome);
			this.actionsBar.push(openHome);

			try {
				const isGithub = githubUrlReg.exec(data.remote.homepage);
				if (isGithub) {
					const readmeUrl = `https://raw.githubusercontent.com/${isGithub[1]}/${isGithub[2]}/master/README.md`;
					this.webviewElement.contents = await this.requestService.request({
						type: 'get',
						url: readmeUrl,
						followRedirects: 5,
					}, token).then(asText)
						.then(marked.parse)
						.then(renderBody);

					this.webviewElement.onDidClickLink(link => {
						if (!link) {
							return;
						}
						// Whitelist supported schemes for links
						if (['http', 'https', 'mailto'].indexOf(link.scheme) >= 0 || (link.scheme === 'command' && link.path === ShowCurrentReleaseNotesAction.ID)) {
							this.openerService.open(link);
						}
					}, null, this.elementDisposables);
				} else {
					// how to do now?
				}
			} catch (e) {
				console.error('README load failed:', e);
			}
		}

		this.layout();
	}

	public layout(dimension: Dimension = this.dimension): void {
		if (!dimension) {
			return;
		}
		this.dimension = dimension;

		this.content.style.height = (dimension.height - this.content.offsetTop).toFixed(0) + 'px';

		this.webviewElement.layout();
	}
}

function renderBody(body: string): string {
	return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src vscode-core-resource:; child-src 'none'; frame-src 'none';">
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
}
