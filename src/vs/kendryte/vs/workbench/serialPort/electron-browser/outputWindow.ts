import { TerminalWidgetManager } from 'vs/workbench/parts/terminal/browser/terminalWidgetManager';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Terminal as XTermTerminal } from 'vscode-xterm';
import { TerminalConfigHelper } from 'vs/workbench/parts/terminal/electron-browser/terminalConfigHelper';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TerminalInstance } from 'vs/workbench/parts/terminal/electron-browser/terminalInstance';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as nls from 'vs/nls';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';

let Terminal: typeof XTermTerminal;

export class OutputXTerminal implements IDisposable {
	private _disposables: IDisposable[] = [];

	private _xterm: XTermTerminal;
	private _xtermElement: HTMLDivElement;
	protected _widgetManager: TerminalWidgetManager;
	protected _configHelper: TerminalConfigHelper;

	protected _isVisible = true;
	protected _wrapperElement: HTMLElement;

	private readonly _onDimensionsChanged: Emitter<void> = new Emitter<void>();
	public get onDimensionsChanged(): Event<void> { return this._onDimensionsChanged.event; }

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService protected readonly _themeService: IThemeService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
	) {
		this._configHelper = instantiationService.createInstance(TerminalConfigHelper);
		Object.assign(this, {
			_getDimension: TerminalInstance.prototype['_getDimension'],
			_safeSetOption: TerminalInstance.prototype['_safeSetOption'],
		});

	}

	public async attachToElement(container: HTMLElement) {
		this._configHelper.panelContainer = container;
		this._wrapperElement = append(container, $('div.terminal-wrapper'));
		this._xtermElement = append(this._wrapperElement, $('div'));

		await this.createXterm();

		this._wrapperElement.style.bottom = '2px';

		this._widgetManager = new TerminalWidgetManager(this._wrapperElement);

	}

	async createXterm() {
		if (!Terminal) {
			Terminal = (await import('vscode-xterm')).Terminal;
			// Enable xterm.js addons
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/search/search'));
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/webLinks/webLinks'));
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/winptyCompat/winptyCompat'));
			// Localize strings
			Terminal.strings.blankLine = nls.localize('terminal.integrated.a11yBlankLine', 'Blank line');
			Terminal.strings.promptLabel = nls.localize('terminal.integrated.a11yPromptLabel', 'Terminal input');
			Terminal.strings.tooMuchOutput = nls.localize('terminal.integrated.a11yTooMuchOutput', 'Too much output to announce, navigate to rows manually to read');
		}
		const font = this._configHelper.getFont(undefined, true);
		const config = this._configHelper.config;
		const accessibilitySupport = this._configurationService.getValue<IEditorOptions>('editor').accessibilitySupport;

		this._xterm = new Terminal({
			scrollback: config.scrollback,
			theme: TerminalInstance.prototype['_getXtermTheme'].call(this),
			drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
			fontFamily: font.fontFamily,
			fontWeight: config.fontWeight,
			fontWeightBold: config.fontWeightBold,
			fontSize: font.fontSize,
			letterSpacing: font.letterSpacing,
			lineHeight: font.lineHeight,
			bellStyle: config.enableBell ? 'sound' : 'none',
			screenReaderMode: accessibilitySupport === 'on',
			macOptionIsMeta: config.macOptionIsMeta,
			macOptionClickForcesSelection: config.macOptionClickForcesSelection,
			rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
			// TODO: Guess whether to use canvas or dom better
			rendererType: config.rendererType === 'auto' ? 'canvas' : config.rendererType,
			// TODO: Remove this once the setting is removed upstream
			experimentalCharAtlas: 'dynamic',
		});

		// this._xterm.on('linefeed', () => this._onLineFeed());

		// TODO: process stdio

		// this._xterm.on('focus', () => this._onFocus.fire(this));

		this._disposables.push(this._themeService.onThemeChange(theme => TerminalInstance.prototype['_getXtermTheme'].call(this, theme)));

		this._xterm.open(this._xtermElement);
	}

	public layout(dimension: Dimension): void {
		const terminalWidth = TerminalInstance.prototype['_evaluateColsAndRows'].call(this, dimension.width, dimension.height);
		if (!terminalWidth) {
			return;
		}

		if (this._xterm) {
			this._xterm.element.style.width = terminalWidth + 'px';
		}

		TerminalInstance.prototype['_resize'].call(this);
	}

	dispose() {
		dispose(this._disposables);
		this._xterm.dispose();
	}
}
