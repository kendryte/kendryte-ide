import {
	TAB_ACTIVE_BACKGROUND,
	TAB_BORDER,
	TAB_HOVER_BACKGROUND,
	TAB_HOVER_BORDER,
	TAB_INACTIVE_BACKGROUND,
	TAB_UNFOCUSED_HOVER_BACKGROUND,
	TAB_UNFOCUSED_HOVER_BORDER,
	Themable,
} from 'vs/workbench/common/theme';
import { ICssStyleCollector, ITheme, IThemeService, registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { activeContrastBorder, contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { $, addDisposableListener, append } from 'vs/base/browser/dom';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import 'vs/css!./tabControl';

interface ITab {
	id: string;
	element: HTMLElement;
	event: IDisposable;
}

export interface ITabOptions {
	height: number;
	padding: number;
}

export class SimpleTabControl extends Themable {
	private readonly tabs: ITab[] = [];
	private _current: HTMLElement;

	private readonly _onChange = new Emitter<string>();
	public readonly onChange = this._onChange.event;

	protected readonly tabOptions: ITabOptions;
	private readonly parent: HTMLElement;

	constructor(
		container: HTMLElement,
		@IThemeService themeService: IThemeService,
	) {
		super(themeService);

		this.tabOptions = {
			height: 35,
			padding: 30,
		};

		this.parent = append(container, $('div.simple-tabs-container'));
		this.parent.setAttribute('role', 'tablist');

		this.updateStyles();
	}

	addTab(id: string): HTMLElement {
		const $tab = append(this.parent, $('div.tab'));

		this._styleTab($tab, this.tabs.length);

		this.tabs.push({
			id,
			element: $tab,
			event: addDisposableListener($tab, 'click', () => {
				this._activate(id, $tab);
			}),
		});

		return $tab;
	}

	removeTab(id: string) {
		const found = this.tabs.findIndex(e => e.id === id);
		if (found === -1) {
			return false;
		}

		const tab = this.tabs[found];
		tab.event.dispose();

		const $tab = tab.element;
		if (this._current === $tab) {
			delete this._current;
		}

		this.parent.removeChild($tab);

		return true;
	}

	dispose() {
		dispose(this.tabs.map(e => e.event));
		super.dispose();
	}

	updateStyles(tabOptions?: ITabOptions) {
		if (tabOptions) {
			this.parent.style.lineHeight = this.tabOptions.height + 'px';
			Object.assign(this.tabOptions, tabOptions);
		}
		this.tabs.forEach(({ element }, index) => {
			this._styleTab(element, index);
		});
	}

	private _styleTab(tab: HTMLElement, index: number) {
		const borderSplitColor = this.getColor(TAB_BORDER) || this.getColor(contrastBorder);
		const borderLeftColor = (index !== 0) ? borderSplitColor : null;
		// const borderRightColor = (index === this.group.count - 1) ? (this.getColor(TAB_BORDER) || this.getColor(contrastBorder)) : null;
		tab.style.borderLeft = borderLeftColor ? `1px solid ${borderLeftColor}` : null;
		// tab.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : null;
		tab.style.outlineColor = this.getColor(activeContrastBorder) || '';

		tab.style.lineHeight = this.tabOptions.height + 'px';
		tab.style.paddingRight = tab.style.paddingLeft = (this.tabOptions.padding / 2) + 'px';
	}

	private _activate(id: string, $tab: HTMLElement) {
		if (this._current) {
			this._current.classList.remove('active');
		}
		this._current = $tab;
		$tab.classList.add('active');

		this._onChange.fire(id);
	}
}

registerThemingParticipant((theme: ITheme, collector: ICssStyleCollector) => {

	// Styling with Outline color (e.g. high contrast theme)
	const activeContrastBorderColor = theme.getColor(activeContrastBorder);
	if (activeContrastBorderColor) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab.active,
			.monaco-workbench .simple-tabs-container > .tab.active:hover  {
				outline: 1px solid;
				outline-offset: -5px;
			}

			.monaco-workbench .simple-tabs-container > .tab:hover  {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .simple-tabs-container > .tab.active > .tab-close .action-label,
			.monaco-workbench .simple-tabs-container > .tab.active:hover > .tab-close .action-label,
			.monaco-workbench .simple-tabs-container > .tab.dirty > .tab-close .action-label,
			.monaco-workbench .simple-tabs-container > .tab:hover > .tab-close .action-label {
				opacity: 1 !important;
			}
		`);
	}

	// Inactive Background
	const tabInactiveBackground = theme.getColor(TAB_INACTIVE_BACKGROUND);
	if (tabInactiveBackground) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab  {
				background-color: ${tabInactiveBackground} !important;
			}
		`);
	}
	// Active Background
	const tabActiveBackground = theme.getColor(TAB_ACTIVE_BACKGROUND);
	if (tabActiveBackground) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab.active  {
				background-color: ${tabActiveBackground} !important;
			}
		`);
	}

	// Hover Background
	const tabHoverBackground = theme.getColor(TAB_HOVER_BACKGROUND);
	if (tabHoverBackground) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab:hover  {
				background-color: ${tabHoverBackground} !important;
			}
		`);
	}

	const tabUnfocusedHoverBackground = theme.getColor(TAB_UNFOCUSED_HOVER_BACKGROUND);
	if (tabUnfocusedHoverBackground) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab:hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
	}

	// Hover Border
	const tabHoverBorder = theme.getColor(TAB_HOVER_BORDER);
	if (tabHoverBorder) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab:hover  {
				box-shadow: ${tabHoverBorder} 0 -1px inset !important;
			}
		`);
	}

	const tabUnfocusedHoverBorder = theme.getColor(TAB_UNFOCUSED_HOVER_BORDER);
	if (tabUnfocusedHoverBorder) {
		collector.addRule(`
			.monaco-workbench .simple-tabs-container > .tab:hover  {
				box-shadow: ${tabUnfocusedHoverBorder} 0 -1px inset !important;
			}
		`);
	}
});
