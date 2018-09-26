import { $, addDisposableListener, append, Dimension, EventType, getClientArea, hide, show } from 'vs/base/browser/dom';
import { IDisposable } from 'vs/base/common/lifecycle';
import { assign } from 'vs/base/common/objects';
import { isWindows } from 'vs/base/common/platform';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { editorBackground, editorForeground, editorWidgetBorder } from 'vs/platform/theme/common/colorRegistry';
import { ITheme, IThemeService } from 'vs/platform/theme/common/themeService';
import { Composite } from 'vs/workbench/browser/composite';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import 'vs/css!vs/kendryte/vs/workbench/popupViewer/browser/frame';

const zIndex = 998;

// to apply css
let path = require.toUrl('./frame.html').replace('file://', '');
if (isWindows) {
	path = path.replace(/^\//, '');
}
const fakeRoot = require('fs').readFileSync(path, 'utf8').replace(/{\s*title\s*}/g, localize('settings', 'Settings Page'));

export class FullScreenEditor extends Composite {
	private readonly $mask: FullScreenMask;
	private readonly $root: HTMLElement;
	private readonly $dialog: HTMLElement;
	private readonly $dialogInner: HTMLElement;
	private readonly $title: HTMLElement;
	private readonly $content: HTMLElement;

	constructor(
		private readonly $editor: BaseEditor,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
	) {
		super($editor.getId(), telemetryService, themeService);

		const id = $editor.getId();

		this.$mask = new FullScreenMask(id);
		this._register(this.$mask);
		this._register(this.$editor);

		this.$root = $$('FullScreenEditor', id, container(zIndex + 1));
		this.$root.classList.add('monaco-workbench');
		this.$root.innerHTML = fakeRoot;

		this.$dialog = this.$root.querySelector('.part.editor');

		this.$dialogInner = this.$dialog.querySelector('div.content');
		this.$content = this.$dialogInner.querySelector('div.main-fake-container');
		this.$title = this.$dialogInner.querySelector('div.one-editor-silo');

		$editor.create(this.$content);

		this._register(addDisposableListener(window, EventType.RESIZE, () => this.layout()));
		this._register(addDisposableListener(this.$title, EventType.CLICK, this.click.bind(this)));

		this._register(themeService.onThemeChange(newTheme => this.changeTheme(newTheme)));
		this.changeTheme(themeService.getTheme());
	}

	changeTheme(theme: ITheme): any {
		assign(this.$dialog.style, {
			backgroundColor: theme.getColor(editorBackground).toString(),
			borderColor: theme.getColor(editorWidgetBorder).toString(),
		} as Partial<CSSStyleDeclaration>);
		const tab: HTMLDivElement = this.$dialogInner.querySelector('.tab.has-icon-theme');
		tab.style.backgroundColor = theme.getColor(editorBackground).toString();

		const lbl: HTMLDivElement = this.$dialogInner.querySelector('.monaco-icon-label');
		lbl.style.color = theme.getColor(editorForeground).toString();
	}

	async create(): TPromise<void> {
		append(document.body, this.$root);
		await this.$mask.create();
	}

	async setVisible(visible: boolean): TPromise<void> {
		await this.$mask.setVisible(visible);
		if (visible) {
			this.$root.style.display = 'flex';
		} else {
			this.$root.style.display = 'none';
		}
	}

	private click(e: MouseEvent) {
		if ((e.target as HTMLAnchorElement).tagName === 'A') {
			this.dispose();
		}
	}

	dispose() {
		document.body.removeChild(this.$root);
		super.dispose();
	}

	public layout(): void {
		const { width } = getClientArea(document.body);
		this.$dialog.style.width = (0.8 * width).toFixed(2) + 'px';
		const { clientWidth, clientHeight } = this.$dialogInner;

		const size: Dimension = {
			width: clientWidth,
			height: clientHeight - this.$title.clientHeight,
		};

		this.$content.style.height = size.height + 'px';
		this.$content.style.width = size.width + 'px';
		this.$editor.layout(size);
	}

	public registerDispose(rel: IDisposable) {
		this._register(rel);
	}
}

class FullScreenMask implements IDisposable {
	private readonly $mask: HTMLElement;

	constructor(id: string) {
		this.$mask = $$('FullScreenMask', id, container(zIndex - 1, 'rgba(0,0,0,0.5)'));
	}

	setVisible(visible: boolean) {
		if (visible) {
			show(this.$mask);
		} else {
			hide(this.$mask);
		}
	}

	create() {
		append(document.body, this.$mask);
	}

	dispose() {
		document.body.removeChild(this.$mask);
	}
}

function $$(id: string, className: string, ...styles: Partial<CSSStyleDeclaration>[]) {
	let b = 'div';
	if (id) {
		b += `#${id}`;
	}
	if (className) {
		b += `.${className}`;
	}
	const $dom = $(b);
	if (styles.length) {
		assign($dom.style, ...styles);
	}
	return $dom;
}

function container(zIndex: number, backgroundColor = 'transparent') {
	return {
		display: 'none',
		position: 'absolute',
		zIndex: zIndex.toFixed(0),
		left: '0',
		width: '100%',
		top: '0',
		height: '100%',
		backgroundColor,
	};
}